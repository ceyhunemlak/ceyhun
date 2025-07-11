import { v2 as cloudinary } from 'cloudinary';

// Ensure we have environment variables
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Log configuration status (helpful for debugging)
if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary environment variables!', { 
    cloudName: !!cloudName, 
    apiKey: !!apiKey, 
    apiSecret: !!apiSecret 
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

/**
 * Uploads a file to Cloudinary
 * @param file Buffer containing the file data
 * @param folder Folder path in Cloudinary
 * @param publicId Public ID for the file
 * @returns Object containing the public_id and secure_url of the uploaded file
 */
export const uploadToCloudinary = async (
  file: Buffer,
  folder: string,
  publicId: string
): Promise<{ id: string; url: string }> => {
  try {
    // Convert buffer to base64
    const base64Data = `data:image/jpeg;base64,${file.toString('base64')}`;
    
    // Create options for upload
    const uploadOptions = {
      folder,
      public_id: publicId,
      overwrite: true,
      resource_type: 'auto' as 'auto',
      use_filename: false,
      unique_filename: false,
      // Improved optimization options
      quality: 'auto:good', // Changed from auto:low to auto:good for better quality
      fetch_format: 'auto', // Automatic format optimization
      transformation: [
        { 
          quality: 'auto:good', // Better quality
          fetch_format: 'auto',
          dpr: 'auto',
          // Resize any large images to reasonable dimensions
          width: 1600, 
          height: 1600,
          crop: 'limit'
        }
      ],
      eager_async: false, // Changed to false to ensure transformations are complete before URL is returned
      format: 'jpg', // Force jpg format for consistency
      chunk_size: 6000000, // Reduced chunk size for uploads (6MB)
    };
    
    // Upload to Cloudinary with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        const result = await cloudinary.uploader.upload(base64Data, uploadOptions);
        
        // Verify the result has the expected fields
        if (!result.public_id || !result.secure_url) {
          throw new Error('Invalid response from Cloudinary');
        }
        
        return {
          id: result.public_id,
          url: result.secure_url
        };
      } catch (error) {
        lastError = error;
        attempts++;
        if (attempts < maxAttempts) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          console.log(`Retrying upload attempt ${attempts}/${maxAttempts}`);
        }
      }
    }
    
    // If we've exhausted all attempts
    console.error('Error uploading to Cloudinary after multiple attempts:', lastError);
    throw new Error('Failed to upload image to Cloudinary after multiple attempts');
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Deletes a specific image from Cloudinary using multiple methods to ensure deletion
 * @param publicId Public ID of the image to delete
 * @returns True if deletion was successful, false otherwise
 */
export const deleteCloudinaryImage = async (publicId: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete Cloudinary image with multiple methods: ${publicId}`);
    
    let success = false;
    const errors = [];
    
    // Method 1: Standard destroy
    try {
      console.log(`Method 1: Standard destroy for ${publicId}`);
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`Method 1 result:`, result);
      
      if (result.result === 'ok' || result.result === 'not found') {
        success = true;
        console.log(`Successfully deleted image ${publicId} using standard destroy`);
        return true;
      } else {
        errors.push(`Standard destroy failed: ${result.result}`);
      }
    } catch (error) {
      console.error(`Error in Method 1 (standard destroy) for ${publicId}:`, error);
      errors.push(`Standard destroy error: ${error instanceof Error ? error.message : String(error)}`);
      // Continue to next method
    }
    
    // Method 2: Explicit resource type
    if (!success) {
      try {
        console.log(`Method 2: Explicit resource type for ${publicId}`);
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        console.log(`Method 2 result:`, result);
        
        if (result.result === 'ok' || result.result === 'not found') {
          success = true;
          console.log(`Successfully deleted image ${publicId} using explicit resource type`);
          return true;
        } else {
          errors.push(`Explicit resource type failed: ${result.result}`);
        }
      } catch (error) {
        console.error(`Error in Method 2 (explicit resource type) for ${publicId}:`, error);
        errors.push(`Explicit resource type error: ${error instanceof Error ? error.message : String(error)}`);
        // Continue to next method
      }
    }
    
    // Method 3: Admin API
    if (!success) {
      try {
        console.log(`Method 3: Admin API for ${publicId}`);
        const result = await cloudinary.api.delete_resources([publicId], { resource_type: 'image' });
        console.log(`Method 3 result:`, result);
        
        success = true;
        console.log(`Successfully deleted image ${publicId} using admin API`);
        return true;
      } catch (error) {
        console.error(`Error in Method 3 (admin API) for ${publicId}:`, error);
        errors.push(`Admin API error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    if (!success) {
      console.error(`Failed to delete image ${publicId} using all methods. Errors:`, errors);
      return false;
    }
    
    return success;
  } catch (error) {
    console.error(`Unexpected error deleting image ${publicId}:`, error);
    return false;
  }
};

/**
 * Renames a folder in Cloudinary directly using the API without moving files
 * @param oldFolderPath Current path of the folder
 * @param newFolderPath New path for the folder
 * @returns Object with success status and mapping of old IDs to new IDs and URLs
 */
export const renameCloudinaryFolder = async (
  oldFolderPath: string, 
  newFolderPath: string
): Promise<{ 
  success: boolean; 
  movedResources: Array<{ 
    oldId: string; 
    newId: string; 
    newUrl: string 
  }> 
}> => {
  const movedResources: Array<{ oldId: string; newId: string; newUrl: string }> = [];
  
  try {
    console.log(`Attempting to rename Cloudinary folder from ${oldFolderPath} to ${newFolderPath}`);
    
    // Check if old and new paths are the same
    if (oldFolderPath === newFolderPath) {
      console.log('Old and new folder paths are identical, no need to rename');
      
      // Even if paths are identical, we still want to return resource information
      try {
        const resources = await cloudinary.search
          .expression(`folder:${oldFolderPath}`)
          .max_results(500)
          .execute();
        
        if (resources && resources.resources && resources.resources.length > 0) {
          console.log(`Found ${resources.resources.length} resources in folder`);
          
          // Create resource mapping with same IDs (no actual move)
          for (const resource of resources.resources) {
            movedResources.push({
              oldId: resource.public_id,
              newId: resource.public_id,
              newUrl: resource.secure_url
            });
          }
          
          return { success: true, movedResources };
        }
      } catch (error) {
        console.error(`Error retrieving resources from folder ${oldFolderPath}:`, error);
      }
      
      return { success: true, movedResources };
    }
    
    try {
      // Directly rename the folder using Cloudinary API
      await cloudinary.api.rename_folder(oldFolderPath, newFolderPath);
      console.log(`Successfully renamed folder from ${oldFolderPath} to ${newFolderPath}`);
      
      // Get resources in the renamed folder to update references
      const resources = await cloudinary.search
        .expression(`folder:${newFolderPath}`)
        .max_results(500)
        .execute();
      
      if (resources && resources.resources && resources.resources.length > 0) {
        console.log(`Found ${resources.resources.length} resources in renamed folder`);
        
        // Map old IDs to new IDs based on the folder path change
        for (const resource of resources.resources) {
          const newId = resource.public_id;
          const oldId = newId.replace(newFolderPath, oldFolderPath);
          
          movedResources.push({
            oldId,
            newId,
            newUrl: resource.secure_url
          });
        }
      }
      
      return { 
        success: true,
        movedResources
      };
    } catch (error) {
      console.error(`Error directly renaming Cloudinary folder: ${error instanceof Error ? error.message : String(error)}`);
      
      // If direct renaming fails, we'll log the error but not attempt the old method
      console.log('Direct folder renaming failed. Please check Cloudinary permissions or API capabilities.');
      
      return { 
        success: false,
        movedResources
      };
    }
  } catch (error) {
    console.error(`Error in renameCloudinaryFolder: ${error instanceof Error ? error.message : String(error)}`);
    return { 
      success: false,
      movedResources
    };
  }
};

/**
 * Deletes a folder and all its contents from Cloudinary using multiple methods
 * @param folderPath Path of the folder to delete (e.g. 'ceyhun-emlak/konut/my-listing')
 * @returns True if deletion was successful, false otherwise
 */
export const deleteCloudinaryFolder = async (folderPath: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete Cloudinary folder with multiple methods: ${folderPath}`);
    
    // Method 1: Standard approach - delete resources first, then folder
    try {
      console.log(`Method 1: Standard approach for folder ${folderPath}`);
      
      // First, check if folder exists and has resources
      let hasResources = false;
      let folderExists = false;
      
      try {
        // Check for resources in the folder
        const resources = await cloudinary.search
          .expression(`folder:${folderPath}`)
          .max_results(10)
          .execute();
        
        const resourceCount = resources?.resources?.length || 0;
        console.log(`Found ${resourceCount} resources in folder ${folderPath}`);
        hasResources = resourceCount > 0;
        folderExists = true; // If we can search resources, folder exists
      } catch (searchError) {
        // If search fails, try checking if the folder exists
        try {
          const parentPath = folderPath.split('/').slice(0, -1).join('/');
          const folderName = folderPath.split('/').pop();
          
          const subFolders = await cloudinary.api.sub_folders(parentPath);
          folderExists = subFolders.folders.some((folder: any) => 
            folder.name === folderName || folder.path === folderPath
          );
          
          console.log(`Folder ${folderPath} exists: ${folderExists}`);
        } catch (folderCheckError) {
          console.log(`Could not check if folder ${folderPath} exists, continuing anyway`);
        }
      }
      
      // If folder doesn't exist, consider it already deleted
      if (!folderExists) {
        console.log(`Folder ${folderPath} does not exist, considering it already deleted`);
        return true;
      }
      
      // Delete resources first if they exist
      if (hasResources) {
        try {
          console.log(`Deleting resources in folder ${folderPath}`);
          const deleteResult = await cloudinary.api.delete_resources_by_prefix(folderPath);
          console.log(`Resources deletion result:`, deleteResult);
        } catch (resourcesError) {
          console.error(`Error deleting resources in folder ${folderPath}:`, resourcesError);
          // Continue trying to delete the folder even if resource deletion fails
        }
      }
      
      // Then delete the folder
      try {
        console.log(`Deleting folder ${folderPath}`);
        const folderDeleteResult = await cloudinary.api.delete_folder(folderPath);
        console.log(`Folder deletion result:`, folderDeleteResult);
        console.log(`Successfully deleted folder ${folderPath} using Method 1`);
        return true;
      } catch (folderError) {
        console.error(`Error deleting folder ${folderPath} using Method 1:`, folderError);
        // Continue to next method
      }
    } catch (method1Error) {
      console.error(`Error in Method 1 for folder ${folderPath}:`, method1Error);
      // Continue to next method
    }
    
    // Method 2: Try deleting with explicit resource types first
    try {
      console.log(`Method 2: Explicit resource types for folder ${folderPath}`);
      
      // Try to delete resources of different types
      const resourceTypes = ['image', 'video', 'raw'];
      
      for (const resourceType of resourceTypes) {
        try {
          console.log(`Deleting ${resourceType} resources in folder ${folderPath}`);
          await cloudinary.api.delete_resources_by_prefix(folderPath, { resource_type: resourceType });
        } catch (resourceError) {
          console.error(`Error deleting ${resourceType} resources in folder ${folderPath}:`, resourceError);
          // Continue with next resource type
        }
      }
      
      // Then try to delete the folder
      try {
        console.log(`Deleting folder ${folderPath} after explicit resource deletion`);
        await cloudinary.api.delete_folder(folderPath);
        console.log(`Successfully deleted folder ${folderPath} using Method 2`);
        return true;
      } catch (folderError) {
        console.error(`Error deleting folder ${folderPath} using Method 2:`, folderError);
        // Continue to next method
      }
    } catch (method2Error) {
      console.error(`Error in Method 2 for folder ${folderPath}:`, method2Error);
      // Continue to next method
    }
    
    // Method 3: Try with admin API
    try {
      console.log(`Method 3: Admin API for folder ${folderPath}`);
      
      // First try to list all resources in the folder
      try {
        const allResources = await cloudinary.search
          .expression(`folder:${folderPath}`)
          .max_results(500)
          .execute();
        
        if (allResources && allResources.resources && allResources.resources.length > 0) {
          console.log(`Found ${allResources.resources.length} resources to delete individually`);
          
          // Delete each resource individually
          const publicIds = allResources.resources.map((resource: any) => resource.public_id);
          
          // Delete in batches of 100
          const batchSize = 100;
          for (let i = 0; i < publicIds.length; i += batchSize) {
            const batch = publicIds.slice(i, i + batchSize);
            try {
              await cloudinary.api.delete_resources(batch, { resource_type: 'image' });
              console.log(`Deleted batch ${i / batchSize + 1} of resources`);
            } catch (batchError) {
              console.error(`Error deleting batch ${i / batchSize + 1}:`, batchError);
            }
          }
        }
      } catch (listError) {
        console.error(`Error listing resources in folder ${folderPath}:`, listError);
      }
      
      // Try to delete the folder again
      try {
        await cloudinary.api.delete_folder(folderPath);
        console.log(`Successfully deleted folder ${folderPath} using Method 3`);
        return true;
      } catch (folderError) {
        console.error(`Error deleting folder ${folderPath} using Method 3:`, folderError);
        // All methods failed
        return false;
      }
    } catch (method3Error) {
      console.error(`Error in Method 3 for folder ${folderPath}:`, method3Error);
      return false;
    }
  } catch (error) {
    console.error(`Unexpected error in deleteCloudinaryFolder for ${folderPath}:`, error);
    return false;
  }
}; 

// Export cloudinary instance for direct use
export { cloudinary }; 