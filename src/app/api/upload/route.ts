import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, cloudinary } from '@/lib/cloudinary';

// Increase maxDuration for processing large files
export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

// Helper function to sanitize title for use in folder names
const sanitizeTitle = (title: string): string => {
  // Replace Turkish characters with their ASCII equivalents
  const turkishChars: Record<string, string> = {
    'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
  };
  
  let sanitized = title.toLowerCase();
  
  // Replace Turkish characters
  Object.entries(turkishChars).forEach(([turkishChar, asciiChar]) => {
    sanitized = sanitized.replace(new RegExp(turkishChar, 'g'), asciiChar);
  });
  
  // Replace spaces with hyphens and remove special characters
  sanitized = sanitized
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .substring(0, 50); // Limit length to 50 characters
  
  return sanitized;
};

// Cache for folder names to ensure all photos from the same listing go to the same folder
const folderCache: Record<string, string> = {};

export async function POST(request: NextRequest) {
  console.log('Upload API called - processing request');
  try {
    // Increase timeout for large files
    const timeout = 60000; // 60 seconds
    
    // Get the content-length header to estimate file size
    const contentLength = request.headers.get('content-length');
    const estimatedSizeMB = contentLength ? Math.round(parseInt(contentLength) / (1024 * 1024) * 100) / 100 : 'unknown';
    console.log(`Estimated file size: ${estimatedSizeMB} MB`);
    
    // Process form data with appropriate timeout
    const formDataPromise = request.formData();
    const formData = await Promise.race([
      formDataPromise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), timeout)
      )
    ]) as FormData;
    
    const file = formData.get('file') as File;
    const propertyType = formData.get('propertyType') as string;
    const listingId = formData.get('listingId') as string;
    const index = formData.get('index') as string;
    const title = formData.get('title') as string;
    const existingFolder = formData.get('existingFolder') as string;

    if (!file || !propertyType || !listingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`Uploading file for listing ${listingId}, index ${index}, fileSize: ${Math.round(file.size / 1024)} KB, existingFolder: ${existingFolder || 'none'}`);

    // Process file with chunk-based approach for large files
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Add file size check and log
    const fileSizeMB = buffer.length / (1024 * 1024);
    console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);
    
    // Warn about large files
    if (fileSizeMB > 5) {
      console.warn(`Processing large file (${fileSizeMB.toFixed(2)} MB). This may take longer.`);
    }

    // Determine folder path - existing logic...
    let folder: string;
    
    // If existing folder is provided, use it
    if (existingFolder) {
      folder = existingFolder;
      console.log(`Using provided existing folder: ${folder}`);
      
      // Update cache for this listing
      const cacheKey = `${propertyType}_${listingId}`;
      folderCache[cacheKey] = folder;
    } else {
      // Check if we already have a folder for this listing
      const cacheKey = `${propertyType}_${listingId}`;
      folder = folderCache[cacheKey];
      
      // If no folder in cache, create a new one
      if (!folder) {
        // Sanitize title for folder name
        const sanitizedTitle = title ? sanitizeTitle(title) : listingId;
        
        // Base folder path
        const baseFolder = `ceyhun-emlak/${propertyType}`;
        
        // Check if folder with this title already exists
        let folderSuffix = '';
        let folderExists = true;
        let attemptCount = 0;
        
        // Try to find a unique folder name
        while (folderExists && attemptCount < 10) {
          const folderName = sanitizedTitle + folderSuffix;
          const fullFolderPath = `${baseFolder}/${folderName}`;
          
          try {
            // Check if folder exists in Cloudinary
            console.log(`Checking if folder exists: ${fullFolderPath}`);
            const result = await cloudinary.api.resources({
              type: 'upload',
              prefix: fullFolderPath,
              max_results: 1
            });
            
            // If no resources found, folder doesn't exist or is empty
            if (result.resources.length === 0) {
              folderExists = false;
              console.log(`Folder ${fullFolderPath} is empty or doesn't exist`);
            } else {
              // Folder exists, try next suffix
              attemptCount++;
              folderSuffix = `-${attemptCount}`;
              console.log(`Folder ${fullFolderPath} exists, trying with suffix: ${folderSuffix}`);
            }
          } catch (error) {
            // If error is related to "not found", folder doesn't exist
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('not found')) {
              folderExists = false;
              console.log(`Folder ${fullFolderPath} not found, will use this path`);
            } else {
              // For other errors, log and continue with default behavior
              console.error('Error checking folder existence:', error);
              folderExists = false;
              // Fallback to a safe folder name in case of errors
              folderSuffix = `-${Date.now().toString().slice(-6)}`;
              console.log(`Using fallback folder suffix due to error: ${folderSuffix}`);
            }
          }
        }
        
        // If we couldn't find a unique name after 10 attempts, use timestamp
        if (attemptCount >= 10) {
          folderSuffix = `-${Date.now().toString().slice(-6)}`;
          console.log(`Reached max attempts, using timestamp suffix: ${folderSuffix}`);
        }
        
        // Final folder name
        const finalFolderName = sanitizedTitle + folderSuffix;
        folder = `${baseFolder}/${finalFolderName}`;
        
        // Save to cache for future uploads from the same listing
        folderCache[cacheKey] = folder;
        
        console.log(`Created new folder path: ${folder}`);
      } else {
        console.log(`Using cached folder path: ${folder}`);
      }
    }
    
    // Create unique public ID for the image
    const publicId = `image_${index}`;
    
    console.log(`Uploading to folder: ${folder}, publicId: ${publicId}`);

    // Upload to Cloudinary with improved error handling
    try {
      // Upload to Cloudinary with timeout
      const uploadPromise = uploadToCloudinary(buffer, folder, publicId);
      
      // Add timeout for the upload operation
      const result = await Promise.race([
        uploadPromise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Upload timed out')), timeout)
        )
      ]);
      
      console.log(`Upload successful. ID: ${result.id}, URL: ${result.url}`);

      return NextResponse.json(result);
    } catch (uploadError) {
      console.error('Error during Cloudinary upload:', uploadError);
      
      // Provide more detailed error information
      const errorMessage = uploadError instanceof Error 
        ? uploadError.message 
        : String(uploadError);
      
      return NextResponse.json(
        { 
          error: 'Failed to upload image to Cloudinary',
          details: errorMessage,
          fileSize: `${fileSizeMB.toFixed(2)} MB` 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in upload route:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for timeout errors specifically
    if (errorMessage.includes('timed out')) {
      return NextResponse.json(
        { 
          error: 'Upload timed out - file may be too large',
          details: errorMessage
        },
        { status: 408 } // Request Timeout
      );
    }
    
    // Check for content too large errors
    if (errorMessage.includes('content length')) {
      return NextResponse.json(
        { 
          error: 'File is too large to upload',
          details: errorMessage
        },
        { status: 413 } // Content Too Large
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 