'use client';

import { useState, useRef } from 'react';
import { FaCamera, FaUpload, FaLink } from 'react-icons/fa';
import { useUploadThing } from '@/lib/uploadthing';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  onImageUrl: (url: string) => void;
  currentImageUrl?: string;
}

export default function ImageUpload({ onImageSelect, onImageUrl, currentImageUrl }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("imageUploader");

  const validateAndUploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image must be less than 4MB');
      return;
    }

    try {
      setUploading(true);
      const uploadResult = await startUpload([file]);
      
      if (uploadResult && uploadResult[0]) {
        const downloadUrl = uploadResult[0].url;
        setPreview(downloadUrl);
        onImageSelect(file);
        onImageUrl(downloadUrl);
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await validateAndUploadImage(file);
    }
  };

  const handleUrlSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setPreview(urlInput.trim());
      onImageUrl(urlInput.trim());
      setShowUrlInput(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Preview Section */}
      <div className="w-full h-full">
        {preview ? (
          <div className="relative w-full aspect-square md:aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => {
                toast.error('Invalid image URL');
                setPreview('');
                onImageSelect(null);
              }}
            />
            <button
              type="button"
              onClick={() => {
                setPreview('');
                onImageSelect(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center aspect-square md:aspect-video w-full">
            <p className="text-gray-500">Upload an image, take a photo, or enter a URL</p>
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="w-full flex flex-col justify-center">
        <div className="grid grid-cols-1 gap-3 w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            ref={cameraInputRef}
          />
          
          {showUrlInput ? (
            <div className="grid grid-cols-1 gap-2 w-full">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter image URL"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(false);
                    setUrlInput('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <FaUpload />
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FaCamera />
                {uploading ? 'Uploading...' : 'Take Photo'}
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <FaLink />
                URL
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 