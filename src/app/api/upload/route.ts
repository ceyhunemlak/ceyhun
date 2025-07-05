import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, cloudinary } from '@/lib/cloudinary';

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
  try {
    const formData = await request.formData();
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

    console.log(`Uploading file for listing ${listingId}, index ${index}, existingFolder: ${existingFolder || 'none'}`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine folder path
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

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, folder, publicId);
    console.log(`Upload successful. ID: ${result.id}, URL: ${result.url}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 