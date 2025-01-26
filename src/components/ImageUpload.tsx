'use client';

import { useState, useRef } from 'react';
import { FaCamera, FaUpload, FaLink } from 'react-icons/fa';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageSelect: (url: string) => void;
  currentImageUrl?: string;
}

export default function ImageUpload({ onImageSelect, currentImageUrl }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateAndUploadImage = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create a unique filename
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const storageRef = ref(storage, `items/${uniqueFilename}`);

      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      // Update preview and notify parent
      setPreview(downloadUrl);
      onImageSelect(downloadUrl);
      toast.success('Image uploaded successfully!');
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

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    try {
      // Validate URL
      const url = new URL(urlInput);
      
      // Test if the URL points to an image
      const response = await fetch(url.toString(), { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      if (!contentType?.startsWith('image/')) {
        throw new Error('URL does not point to a valid image');
      }

      setPreview(urlInput);
      onImageSelect(urlInput);
      setShowUrlInput(false);
      setUrlInput('');
      toast.success('Image URL added successfully!');
    } catch (error) {
      toast.error('Please enter a valid image URL');
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
                onImageSelect('');
              }}
            />
            <button
              type="button"
              onClick={() => {
                setPreview('');
                onImageSelect('');
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