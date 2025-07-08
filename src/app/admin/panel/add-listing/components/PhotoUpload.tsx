"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { X, Upload, AlertCircle, GripVertical } from "lucide-react";
import Image from "next/image";
import { useDrag, useDrop } from "react-dnd";
import { Loader2 } from "lucide-react";

interface PhotoUploadProps {
  formData: {
    photos?: Photo[];
    photosToDelete?: string[];
    uploadPhotosToCloudinary?: (propertyType: string, listingId: string) => Promise<Photo[]>;
    title?: string;
    [key: string]: any;
  };
  updateFormData: (data: Partial<{
    photos: Photo[];
    photosToDelete: string[];
  }>) => void;
  selectedCategory: string;
  tempListingId: string | null;
  setCloudinaryFolder: (folder: string | null) => void;
}

interface Photo {
  id?: string;
  url?: string;
  preview: string;
  file?: File;
  isExisting?: boolean;
  status?: 'uploading' | 'uploaded' | 'error';
  progress?: number;
}

// Sürüklenebilir fotoğraf kartı bileşeni
const DraggablePhotoCard = ({ 
  photo, 
  index, 
  movePhoto, 
  removePhoto,
  retryUpload
}: { 
  photo: Photo; 
  index: number; 
  movePhoto: (dragIndex: number, hoverIndex: number) => void; 
  removePhoto: (index: number) => void;
  retryUpload?: (index: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: "PHOTO",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: "PHOTO",
    hover: (item: { index: number }) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Kendisini kendisinin üzerine bırakma
      if (dragIndex === hoverIndex) {
        return;
      }
      
      movePhoto(dragIndex, hoverIndex);
      
      // Sürüklenen öğenin indeksini güncelle
      item.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  return (
    <div 
      ref={ref}
      className={`relative rounded-lg overflow-hidden border-2 aspect-square ${
        index === 0 ? "border-[#FFB000]" : "border-gray-200"
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Image
        src={photo.preview}
        alt={`Fotoğraf ${index + 1}`}
        fill
        className="object-cover"
      />
      {index === 0 && (
        <div className="absolute top-0 left-0 bg-[#FFB000] text-black text-xs px-2 py-1">
          Vitrin
        </div>
      )}
      
      {/* Status indicators */}
      {photo.status === 'uploading' && (
        <div className="absolute top-0 right-10 bg-amber-500 text-white text-xs px-2 py-1">
          Yükleniyor
        </div>
      )}
      {photo.status === 'uploaded' && (
        <div className="absolute top-0 right-10 bg-green-500 text-white text-xs px-2 py-1">
          Yüklendi
        </div>
      )}
      {photo.status === 'error' && (
        <div className="absolute top-0 right-10 bg-red-500 text-white text-xs px-2 py-1">
          Hata
        </div>
      )}
      {photo.isExisting && !photo.status && (
        <div className="absolute top-0 right-10 bg-blue-500 text-white text-xs px-2 py-1">
          Mevcut
        </div>
      )}
      
      {/* Progress bar */}
      {photo.status === 'uploading' && typeof photo.progress === 'number' && (
        <div className="absolute bottom-8 left-0 right-0 h-2 bg-gray-200">
          <div 
            className="h-full bg-green-500 transition-all duration-300 ease-out"
            style={{ width: `${photo.progress}%` }}
          />
        </div>
      )}
      
      {/* Retry button for failed uploads */}
      {photo.status === 'error' ? (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-0 right-0 h-6 rounded-sm m-1"
          onClick={() => retryUpload ? retryUpload(index) : removePhoto(index)}
        >
          Yeniden Yükle
        </Button>
      ) : (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-0 right-0 h-6 w-6 rounded-full m-1"
          onClick={() => removePhoto(index)}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 flex items-center justify-center cursor-move">
        <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
};

export default function PhotoUpload({ 
  formData, 
  updateFormData, 
  selectedCategory, 
  tempListingId, 
  setCloudinaryFolder 
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>(formData.photos || []);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>(formData.photosToDelete || []);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Create a set of existing photo IDs for quick lookup
  const existingPhotoIds = useMemo(() => {
    const idSet = new Set<string>();
    if (photos) {
      photos.forEach(photo => {
        if (photo.isExisting && photo.id) {
          idSet.add(photo.id);
        }
      });
    }
    return idSet;
  }, [photos]);

  // When formData.photos changes (e.g., from parent component), update our local state
  useEffect(() => {
    if (formData.photos) {
      // Ensure we don't have duplicates by checking IDs
      const uniquePhotos: Photo[] = [];
      const seenIds = new Set<string>();
      
      formData.photos.forEach((photo: Photo) => {
        if (photo.isExisting && photo.id) {
          if (!seenIds.has(photo.id)) {
            seenIds.add(photo.id);
            uniquePhotos.push(photo);
          } else {
            console.log(`Skipping duplicate photo with ID: ${photo.id}`);
          }
        } else {
          // For new photos, we can't easily detect duplicates, so add them all
          uniquePhotos.push(photo);
        }
      });
      
      setPhotos(uniquePhotos);
    }
  }, [formData.photos]);

  // When photosToDelete changes in formData, update our local state
  useEffect(() => {
    if (formData.photosToDelete) {
      setPhotosToDelete(formData.photosToDelete);
    }
  }, [formData.photosToDelete]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    
    // Check if adding these files would exceed the limit
    if (photos.length + acceptedFiles.length > 50) {
      setError("En fazla 50 fotoğraf yükleyebilirsiniz.");
      // Only add files up to the limit
      const remainingSlots = 50 - photos.length;
      if (remainingSlots <= 0) return;
      
      acceptedFiles = acceptedFiles.slice(0, remainingSlots);
    }
    
    // Check for large dimension photos
    for (const file of acceptedFiles) {
      try {
        // Create image to check dimensions
        const img = document.createElement('img') as HTMLImageElement;
        const objectUrl = URL.createObjectURL(file);
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Check if dimensions are extremely large
            if (img.width > 8000 || img.height > 8000) {
              reject(new Error(`${file.name} boyutları çok büyük (${img.width}x${img.height}). Lütfen daha küçük bir fotoğraf yükleyin.`));
            } else {
              resolve();
            }
          };
          img.onerror = () => reject(new Error(`${file.name} fotoğrafı yüklenemedi.`));
          img.src = objectUrl;
        }).finally(() => {
          URL.revokeObjectURL(objectUrl);
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          return;
        }
      }
    }
    
    // Process accepted files
    const newPhotos = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
      status: 'uploading' as const,
      progress: 0
    }));
    
    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    updateFormData({ photos: updatedPhotos, photosToDelete });
    
    // If we have a temporary listing ID, upload photos immediately
    if (tempListingId && selectedCategory) {
      setIsUploading(true);
      
      // Upload each photo individually with progress tracking
      const uploadPromises = newPhotos.map(async (photo, i) => {
        const photoIndex = photos.length + i;
        
        if (!photo.file) return;
        
        try {
          const photoFormData = new FormData();
          photoFormData.append('file', photo.file);
          photoFormData.append('propertyType', selectedCategory);
          photoFormData.append('listingId', tempListingId);
          photoFormData.append('index', photoIndex.toString());
          
          // Use XMLHttpRequest for progress tracking
          const uploadWithProgress = () => {
            return new Promise<{id: string, url: string}>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              
              // Track upload progress
              xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                  const progressPercent = Math.round((event.loaded / event.total) * 100);
                  
                  // Update the progress in the photos array
                  setPhotos(currentPhotos => {
                    const updatedPhotos = [...currentPhotos];
                    if (updatedPhotos[photoIndex]) {
                      updatedPhotos[photoIndex] = {
                        ...updatedPhotos[photoIndex],
                        progress: progressPercent
                      };
                    }
                    return updatedPhotos;
                  });
                }
              });
              
              // Handle completion
              xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                  } catch (error) {
                    reject(new Error('Invalid response from server'));
                  }
                } else {
                  reject(new Error(`Upload failed with status ${xhr.status}`));
                }
              });
              
              // Handle errors
              xhr.addEventListener('error', () => {
                reject(new Error('Network error occurred during upload'));
              });
              
              xhr.addEventListener('abort', () => {
                reject(new Error('Upload was aborted'));
              });
              
              // Open and send the request
              xhr.open('POST', '/api/upload');
              xhr.send(photoFormData);
            });
          };
          
          // Start the upload
          const result = await uploadWithProgress();
          
          // Update the photo with the uploaded info
          setPhotos(currentPhotos => {
            const updatedPhotos = [...currentPhotos];
            if (updatedPhotos[photoIndex]) {
              updatedPhotos[photoIndex] = {
                ...updatedPhotos[photoIndex],
                id: result.id,
                url: result.url,
                isExisting: true,
                status: 'uploaded',
                progress: 100
              };
            }
            return updatedPhotos;
          });
          
          // Extract folder path from the first uploaded image
          if (i === 0 && result.id) {
            const parts = result.id.split('/');
            parts.pop(); // Remove the last part (image_X)
            const folderPath = parts.join('/');
            setCloudinaryFolder(folderPath);
          }
          
          return result;
        } catch (error) {
          console.error(`Error uploading photo ${i + 1}:`, error);
          
          // Mark the photo as failed
          setPhotos(currentPhotos => {
            const updatedPhotos = [...currentPhotos];
            if (updatedPhotos[photoIndex]) {
              updatedPhotos[photoIndex] = {
                ...updatedPhotos[photoIndex],
                status: 'error'
              };
            }
            return updatedPhotos;
          });
        }
      });
      
      try {
        // Wait for all uploads to complete
        await Promise.allSettled(uploadPromises);
        
        // Get the final state of photos and update form data
        setPhotos(currentPhotos => {
          updateFormData({ photos: currentPhotos, photosToDelete });
          return currentPhotos;
        });
      } catch (error) {
        console.error('Error in batch upload:', error);
      } finally {
        setIsUploading(false);
      }
    }
  }, [photos, updateFormData, photosToDelete, tempListingId, selectedCategory, setCloudinaryFolder]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (fileRejections) => {
      const errors = fileRejections.map(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          return `${rejection.file.name} boyutu çok büyük (max: 10MB)`;
        }
        if (rejection.errors[0].code === 'file-invalid-type') {
          return `${rejection.file.name} desteklenmeyen dosya formatı`;
        }
        return `${rejection.file.name} yüklenemedi`;
      });
      
      setError(errors.join(', '));
    }
  });

  const removePhoto = async (index: number) => {
    const updatedPhotos = [...photos];
    const photo = updatedPhotos[index];
    
    // If it's an existing photo, delete it immediately from Cloudinary and database
    if (photo.isExisting && photo.id) {
      console.log(`Deleting existing photo: ${photo.id}`);
      
      try {
        // Call the direct delete API to remove from database and Cloudinary
        const response = await fetch(`/api/listings/delete-image?id=${encodeURIComponent(photo.id)}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log(`Successfully deleted photo ${photo.id} from server`);
        } else {
          console.error(`Failed to delete photo ${photo.id} from server:`, result.error);
          
          // If the first method fails, try the direct Cloudinary API
          try {
            console.log(`Trying direct Cloudinary API for ${photo.id}`);
            // Make sure we're using the correct API endpoint format
            const cloudinaryResponse = await fetch(`/api/cloudinary/delete?id=${encodeURIComponent(photo.id)}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            const cloudinaryResult = await cloudinaryResponse.json();
            
            if (cloudinaryResult.success) {
              console.log(`Successfully deleted photo ${photo.id} from Cloudinary`);
            } else {
              console.error(`Failed to delete photo ${photo.id} from Cloudinary:`, cloudinaryResult.errors);
              
              // Try one more method with POST and JSON body as a last resort
              try {
                console.log(`Trying POST method for Cloudinary API for ${photo.id}`);
                const postResponse = await fetch(`/api/cloudinary/delete`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ publicId: photo.id }),
                });
                
                const postResult = await postResponse.json();
                
                if (postResult.success) {
                  console.log(`Successfully deleted photo ${photo.id} from Cloudinary using POST method`);
                } else {
                  console.error(`Failed to delete photo ${photo.id} from Cloudinary using POST method:`, postResult.errors);
                  alert(`Fotoğraf silinirken bir hata oluştu. Lütfen tekrar deneyiniz.`);
                }
              } catch (postError) {
                console.error(`Error calling Cloudinary delete API with POST for ${photo.id}:`, postError);
                alert(`Fotoğraf silinirken bir hata oluştu. Lütfen tekrar deneyiniz.`);
              }
            }
          } catch (cloudinaryError) {
            console.error(`Error calling Cloudinary delete API for ${photo.id}:`, cloudinaryError);
          }
        }
      } catch (error) {
        console.error(`Error deleting photo ${photo.id}:`, error);
        alert('Fotoğraf silinirken bir hata oluştu. Lütfen tekrar deneyiniz.');
      }
      
      // Always add to photosToDelete list as a backup for the final update
      const updatedPhotosToDelete = [...photosToDelete, photo.id];
      setPhotosToDelete(updatedPhotosToDelete);
      console.log('Updated photosToDelete list:', updatedPhotosToDelete);
    }
    
    // Release object URL to avoid memory leaks if it's a newly added photo
    if (!photo.isExisting && photo.preview) {
      URL.revokeObjectURL(photo.preview);
    }
    
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
    
    // Make sure we update formData with both the updated photos and the updated photosToDelete list
    const newPhotosToDelete = photo.isExisting && photo.id 
      ? [...photosToDelete, photo.id]
      : photosToDelete;
    
    updateFormData({ 
      photos: updatedPhotos, 
      photosToDelete: newPhotosToDelete 
    });
    
    console.log(`Photo removed. Remaining: ${updatedPhotos.length}, To delete: ${newPhotosToDelete.length}`);
    console.log('Photos to delete IDs:', newPhotosToDelete);
  };

  const movePhoto = (dragIndex: number, hoverIndex: number) => {
    const draggedPhoto = photos[dragIndex];
    const updatedPhotos = [...photos];
    
    // Remove the dragged item
    updatedPhotos.splice(dragIndex, 1);
    // Insert it at the hover position
    updatedPhotos.splice(hoverIndex, 0, draggedPhoto);
    
    setPhotos(updatedPhotos);
    updateFormData({ photos: updatedPhotos, photosToDelete });
  };
  
  // Function to retry uploading a failed photo
  const retryUpload = async (index: number) => {
    if (!tempListingId || !selectedCategory) return;
    
    const photo = photos[index];
    if (!photo || !photo.file) return;
    
    // Update status to uploading
    const updatedPhotos = [...photos];
    updatedPhotos[index] = {
      ...updatedPhotos[index],
      status: 'uploading' as const,
      progress: 0
    };
    setPhotos(updatedPhotos);
    
    try {
      const photoFormData = new FormData();
      photoFormData.append('file', photo.file);
      photoFormData.append('propertyType', selectedCategory);
      photoFormData.append('listingId', tempListingId);
      photoFormData.append('index', index.toString());
      
      // Use XMLHttpRequest for progress tracking
      const uploadWithProgress = () => {
        return new Promise<{id: string, url: string}>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progressPercent = Math.round((event.loaded / event.total) * 100);
              
              // Update the progress in the photos array
              setPhotos(currentPhotos => {
                const updatedPhotos = [...currentPhotos];
                if (updatedPhotos[index]) {
                  updatedPhotos[index] = {
                    ...updatedPhotos[index],
                    progress: progressPercent
                  };
                }
                return updatedPhotos;
              });
            }
          });
          
          // Handle completion
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (error) {
                reject(new Error('Invalid response from server'));
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });
          
          // Handle errors
          xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred during upload'));
          });
          
          xhr.addEventListener('abort', () => {
            reject(new Error('Upload was aborted'));
          });
          
          // Open and send the request
          xhr.open('POST', '/api/upload');
          xhr.send(photoFormData);
        });
      };
      
      // Start the upload
      const result = await uploadWithProgress();
      
      // Update the photo with the uploaded info
      setPhotos(currentPhotos => {
        const updatedPhotos = [...currentPhotos];
        if (updatedPhotos[index]) {
          updatedPhotos[index] = {
            ...updatedPhotos[index],
            id: result.id,
            url: result.url,
            isExisting: true,
            status: 'uploaded' as const,
            progress: 100
          };
        }
        return updatedPhotos;
      });
      
      // Update form data
      updateFormData({ photos, photosToDelete });
      
    } catch (error) {
      console.error(`Error retrying upload for photo ${index}:`, error);
      
      // Mark the photo as failed again
      setPhotos(currentPhotos => {
        const updatedPhotos = [...currentPhotos];
        if (updatedPhotos[index]) {
          updatedPhotos[index] = {
            ...updatedPhotos[index],
            status: 'error' as const
          };
        }
        return updatedPhotos;
      });
    }
  };

  // Extract folder path from an existing photo ID
  const extractFolderPath = (cloudinaryId: string): string | null => {
    if (!cloudinaryId) return null;
    
    const parts = cloudinaryId.split('/');
    // Remove the last part (image_X)
    parts.pop();
    return parts.join('/');
  };

  // Function to upload all photos to Cloudinary when the form is submitted
  const uploadPhotosToCloudinary = async (propertyType: string, listingId: string): Promise<Photo[]> => {
    setIsUploading(true);
    const uploadedPhotos: Photo[] = [];
    
    try {
      // Prepare the title once for all photos
      let folderTitle = '';
      if (typeof formData.title === 'string' && formData.title) {
        folderTitle = formData.title;
      }
      
      // Determine existing folder path from the first existing photo (if any)
      let existingFolderPath: string | null = null;
      const existingPhotos = photos.filter(p => p.isExisting);
      if (existingPhotos.length > 0 && existingPhotos[0].id) {
        existingFolderPath = extractFolderPath(existingPhotos[0].id);
      }
      
      // Track uploaded photos to avoid duplicates
      const uploadedPhotoIds = new Set<string>();
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        
        // Skip if already uploaded (existing photos)
        if (photo.isExisting && photo.id) {
          // Only add if not already in the uploadedPhotos array
          if (!uploadedPhotoIds.has(photo.id)) {
            uploadedPhotoIds.add(photo.id);
            uploadedPhotos.push({
              id: photo.id,
              url: photo.url || '',
              preview: photo.preview,
              isExisting: true
            });
          } else {
            console.log(`Skipping duplicate existing photo: ${photo.id}`);
          }
          continue;
        }
        
        // Skip if file is missing
        if (!photo.file) {
          console.error(`Photo at index ${i} has no file to upload`);
          continue;
        }
        
        const photoFormData = new FormData();
        photoFormData.append('file', photo.file);
        photoFormData.append('propertyType', propertyType);
        photoFormData.append('listingId', listingId);
        photoFormData.append('index', i.toString());
        
        // Add title if available for folder naming
        if (folderTitle) {
          photoFormData.append('title', folderTitle);
        }
        
        // If we have an existing folder path, use it
        if (existingFolderPath) {
          photoFormData.append('existingFolder', existingFolderPath);
        }
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: photoFormData
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload image ${i + 1}`);
        }
        
        const result = await response.json();
        uploadedPhotos.push({
          id: result.id,
          url: result.url,
          preview: photo.preview, // Add the preview from the original photo
          isExisting: false
        });
      }
      
      setIsUploading(false);
      return uploadedPhotos;
    } catch (error) {
      setIsUploading(false);
      console.error('Error uploading photos:', error);
      throw error;
    }
  };

  // Add these methods to the component's exports
  formData.uploadPhotosToCloudinary = uploadPhotosToCloudinary;
  formData.photosToDelete = photosToDelete;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? "border-[#FFB000] bg-[#FFB000]/5" 
              : "border-gray-300 hover:border-[#FFB000]/50 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <h3 className="text-lg font-medium">Fotoğrafları buraya sürükleyin</h3>
            <p className="text-sm text-gray-500">
              veya dosya seçmek için tıklayın (JPG, PNG, WEBP - max: 10MB)
            </p>
            {isDragActive && (
              <p className="text-sm font-medium text-[#FFB000]">Dosyaları buraya bırakın...</p>
            )}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-start"
          >
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        <div className="mt-4">
          {photos.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">
                  Yüklenen Fotoğraflar {photos.length > 0 && `(${photos.length}/50)`}
                </h3>
                <p className="text-sm text-[#FFB000]">İlk fotoğraf vitrin fotoğrafı olarak kullanılacak</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <DraggablePhotoCard
                    key={`photo-${index}-${photo.isExisting ? photo.id : photo.file?.name || Math.random().toString()}`}
                    photo={photo}
                    index={index}
                    movePhoto={movePhoto}
                    removePhoto={removePhoto}
                    retryUpload={retryUpload}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {photos.length > 0 && (
        <div className="pt-4">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-md">
            <p className="text-amber-700 text-sm">
              <strong>İpucu:</strong> Fotoğrafları sürükleyerek sıralayabilirsiniz. İlk sıradaki fotoğraf vitrin fotoğrafı olarak kullanılacaktır.
              {photos.some(p => p.isExisting) && (
                <> &quot;Mevcut&quot; olarak işaretli fotoğraflar daha önce yüklenmiş fotoğraflardır. Bunları silmek veya yerlerini değiştirmek güvenlidir.</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Only show the full-screen loader for bulk operations, not for individual uploads */}
      {isUploading && photos.filter(p => !p.status).length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-[#FFB000] animate-spin mb-4" />
            <p className="text-lg font-medium">Fotoğraflar hazırlanıyor...</p>
            <p className="text-sm text-gray-500">Lütfen bekleyiniz...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
} 