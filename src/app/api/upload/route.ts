import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, cloudinary } from '@/lib/cloudinary';

// Increase maxDuration for processing large files
export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
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
    let existingFolder = formData.get('existingFolder') as string;
    const currentListingId = formData.get('currentListingId') as string;

    if (!file || !propertyType || !listingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`Uploading file for listing ${listingId}, index ${index}, fileSize: ${Math.round(file.size / 1024)} KB, existingFolder: ${existingFolder || 'none'}, currentListingId: ${currentListingId || 'none'}`);
    
    // Düzenleme modunda ve mevcut ID varsa, bunu listingId olarak kullanmalıyız
    const effectiveListingId = currentListingId || listingId;
    
    // Eğer currentListingId varsa, bu düzenleme modudur ve önce ilgili klasörü bulmayı denemeliyiz
    if (currentListingId && !existingFolder) {
      try {
        console.log(`Düzenleme modu, id: ${currentListingId} için klasör aranıyor...`);
        
        // Başlık varsa, başlığa göre klasör oluşturma/arama mantığını uygula
        if (title) {
          // Başlığı temizle ve klasör adı formatına dönüştür
          const sanitizedTitle = title
            .toLowerCase()
            .replace(/[çğıöşü]/g, (c: string) => ({ 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' })[c as keyof { 'ç': string; 'ğ': string; 'ı': string; 'ö': string; 'ş': string; 'ü': string; }] || c)
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 50);
          
          console.log(`Düzenleme modunda başlık kullanılıyor: "${title}", sanitized: "${sanitizedTitle}"`);
          
          // Başlığa göre klasör var mı kontrol et
          const baseFolder = `ceyhun-emlak/${propertyType}`;
          const possibleFolder = `${baseFolder}/${sanitizedTitle}`;
          
          try {
            // Başlığa göre klasör var mı kontrol et
            const result = await cloudinary.api.resources({
              type: 'upload',
              prefix: possibleFolder,
              max_results: 1
            });
            
            if (result.resources.length > 0) {
              // Başlığa göre klasör bulundu, bunu kullan
              existingFolder = possibleFolder;
              console.log(`Başlık ile eşleşen klasör bulundu: ${existingFolder}`);
            } else {
              // Başlığa göre klasör yok, yeni oluşturulacak
              console.log(`Başlık ile eşleşen klasör bulunamadı, yeni klasör oluşturulacak: ${possibleFolder}`);
              // existingFolder null kalacak ve yeni klasör oluşturulacak
            }
          } catch (error) {
            console.log(`Başlık klasörü kontrol hatası (yeni klasör oluşturulacak): ${error instanceof Error ? error.message : String(error)}`);
            // Hata durumunda yeni klasör oluşturulacak
          }
        } else {
          // Başlık yoksa, uyarı ver
          console.log(`Başlık bulunamadı, klasör oluşturulamayacak`);
        }
        
        if (existingFolder) {
          console.log(`Düzenleme modu için klasör bulundu: ${existingFolder}`);
        } else {
          console.log(`Düzenleme modu için klasör bulunamadı, başlıktan yeni klasör oluşturulacak`);
        }
      } catch (error) {
        console.error(`Düzenleme modu klasör arama hatası: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Düzenleme modunda ve mevcut klasör yolu varsa, bunu mutlaka kullanmalıyız
    if (existingFolder) {
      console.log(`Düzenleme modu: Mevcut klasöre yüklenecek: ${existingFolder}`);
    }

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
    
    // If existing folder is provided, use it - this is crucial for edit mode
    if (existingFolder) {
      folder = existingFolder;
      console.log(`Using provided existing folder: ${folder}`);
      
      // Update cache for this listing
      const cacheKey = `${propertyType}_${effectiveListingId}`;
      folderCache[cacheKey] = folder;
      
      // Klasörün Cloudinary'de var olduğundan emin olmak için kontrol
      try {
        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: folder,
          max_results: 1
        });
        
        if (result.resources.length > 0) {
          console.log(`Mevcut klasör ${folder} doğrulandı, bu klasöre yükleme yapılacak`);
        } else {
          console.log(`Uyarı: Mevcut klasör ${folder} Cloudinary'de bulunamadı, ancak yine de bu yolu kullanmaya devam ediyoruz`);
        }
      } catch (error) {
        console.error(`Klasör kontrol hatası (devam ediyoruz): ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      // If no existing folder, check cache first
      const cacheKey = `${propertyType}_${effectiveListingId}`;
      folder = folderCache[cacheKey];
      
      if (!folder) {
        console.log(`No folder in cache for ${cacheKey}, creating new folder path`);
        
        // Base path for all uploads
        const baseFolder = `ceyhun-emlak/${propertyType}`;
        
        // Create a sanitized title slug for the folder name
        // Eğer başlık yoksa, rastgele bir ID oluştur
        let sanitizedTitle = '';
        if (title) {
          // Başlığı temizle ve klasör adı formatına dönüştür
          sanitizedTitle = title
            .toLowerCase()
            .replace(/[çğıöşü]/g, (c: string) => ({ 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' })[c as keyof { 'ç': string; 'ğ': string; 'ı': string; 'ö': string; 'ş': string; 'ü': string; }] || c)
            .replace(/\s+/g, '-')              // Replace spaces with hyphens
            .replace(/[^a-z0-9-]/g, '')        // Remove special characters
            .replace(/-+/g, '-')               // Replace multiple hyphens with single hyphen
            .substring(0, 50);                 // Limit length to 50 characters
            
          if (!sanitizedTitle) {
            sanitizedTitle = `listing-${Date.now().toString().slice(-6)}`;
          }
        } else {
          sanitizedTitle = `listing-${Date.now().toString().slice(-6)}`;
        }
        
        console.log(`Created sanitized title slug: ${sanitizedTitle}`);
        
        // Check if folder already exists and add suffix if needed
        let folderExists = true;
        let attemptCount = 0;
        let folderSuffix = '';
        let fullFolderPath = '';
        
        while (folderExists && attemptCount < 10) {
          fullFolderPath = `${baseFolder}/${sanitizedTitle}${folderSuffix}`;
          
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
    // index değerine timestamp ekleyerek benzersiz olmasını sağlayalım
    // bu şekilde aynı klasöre yüklerken üzerine yazmayı önleyebiliriz
    const timestamp = Date.now().toString().slice(-6);
    const publicId = `image_${index}_${timestamp}`;
    
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