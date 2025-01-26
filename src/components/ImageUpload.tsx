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

    const loadingToastId = toast.loading('Uploading image...');
    setUploading(true);

    try {
      const uploadResult = await startUpload([file]);
      
      if (uploadResult && uploadResult[0]) {
        const downloadUrl = uploadResult[0].url;
        setPreview(downloadUrl);
        onImageSelect(file);
        onImageUrl(downloadUrl);
        toast.dismiss(loadingToastId);
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.dismiss(loadingToastId);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      {/* Preview Section */}
      <div className="w-full">
        {preview ? (
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
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
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center aspect-square">
            <p className="text-gray-500 text-sm">Upload an image, take a photo, or enter a URL</p>
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="w-full">
        <div className="grid grid-cols-1 gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                e.target.value = ''; // Reset input
                validateAndUploadImage(file);
              }
            }}
            className="hidden"
            ref={fileInputRef}
            disabled={uploading}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                e.target.value = ''; // Reset input
                validateAndUploadImage(file);
              }
            }}
            className="hidden"
            ref={cameraInputRef}
            disabled={uploading}
          />
          
          {showUrlInput ? (
            <div className="space-y-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter image URL"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (urlInput.trim()) {
                      setPreview(urlInput.trim());
                      onImageUrl(urlInput.trim());
                      setShowUrlInput(false);
                      setUrlInput('');
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(false);
                    setUrlInput('');
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
              >
                {uploading ? (
                  <span className="animate-pulse">Uploading...</span>
                ) : (
                  <>
                    <FaUpload className="text-sm" />
                    <span className="hidden sm:inline">Upload</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                <FaCamera className="text-sm" />
                <span className="hidden sm:inline">Camera</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                disabled={uploading}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
              >
                <FaLink className="text-sm" />
                <span className="hidden sm:inline">URL</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 