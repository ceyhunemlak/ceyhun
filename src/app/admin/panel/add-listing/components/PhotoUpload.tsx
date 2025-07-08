"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { X, Upload, AlertCircle, GripVertical } from "lucide-react";
import Image from "next/image";
import { useDrag, useDrop } from "react-dnd";

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
}

interface Photo {
  id?: string;
  url?: string;
  preview: string;
  file?: File;
  isExisting?: boolean;
}

// Sürüklenebilir fotoğraf kartı bileşeni
const DraggablePhotoCard = ({ 
  photo, 
  index, 
  movePhoto, 
  removePhoto 
}: { 
  photo: Photo; 
  index: number; 
  movePhoto: (dragIndex: number, hoverIndex: number) => void; 
  removePhoto: (index: number) => void; 
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
      {photo.isExisting && (
        <div className="absolute top-0 right-10 bg-blue-500 text-white text-xs px-2 py-1">
          Mevcut
        </div>
      )}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-0 right-0 h-6 w-6 rounded-full m-1"
        onClick={() => removePhoto(index)}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 flex items-center justify-center cursor-move">
        <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
};

export default function PhotoUpload({ formData, updateFormData }: PhotoUploadProps) {
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
    
    // Process accepted files
    const newPhotos = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }));
    
    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    updateFormData({ photos: updatedPhotos, photosToDelete });
  }, [photos, updateFormData, photosToDelete]);
  
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
            const cloudinaryResponse = await fetch(`/api/cloudinary/delete?id=${encodeURIComponent(photo.id)}`, {
              method: 'DELETE',
            });
            
            const cloudinaryResult = await cloudinaryResponse.json();
            
            if (cloudinaryResult.success) {
              console.log(`Successfully deleted photo ${photo.id} from Cloudinary`);
            } else {
              console.error(`Failed to delete photo ${photo.id} from Cloudinary:`, cloudinaryResult.errors);
              alert(`Fotoğraf silinirken bir hata oluştu. Lütfen tekrar deneyiniz.`);
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
    </motion.div>
  );
} 