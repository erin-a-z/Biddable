'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import ImageUpload from '@/components/ImageUpload';

export default function NewItemPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingPrice, setGeneratingPrice] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    summary: '',
    imageUrl: '',
    startingPrice: '',
    endTime: '',
    reservePrice: '',
  });
  const [imageSrc, setImageSrc] = useState<string>('');

  // Separate state update handlers
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  // Change the image to the url inputted by the user
  const updatePreviewPic = (value: string) => {
    updateFormData('imageUrl', value);
    // Update the image source state
    setImageSrc(value);
  };

  // Simplified generate description function
  const handleGenerateDescription = async () => {
    if (!formData.imageUrl || generating) {
      toast.error('Please provide an image URL first');
      return;
    }
    
    try {
      setGenerating(true);
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: formData.imageUrl,
          title: formData.title || 'Untitled Item'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate description');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        description: data.description
      }));
      toast.success('Description generated successfully!');
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate description');
    } finally {
      setGenerating(false);
    }
  };

  const generateSummary = async () => {
    if (!formData.imageUrl) {
      toast.error('Please provide an image URL first');
      return;
    }

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({imageUrl: formData.imageUrl})
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setFormData(prev => ({
        ...prev,
        summary: data.summary || ''
      }));
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Summary generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate summary');
    }
  };

  // Simplified generate Title function
  const handleGenerateTitle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      toast.error('Please provide an image URL first');
      return;
    }

    setGeneratingTitle(true);

    try {
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: formData.imageUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate title');
      }

      setFormData(prev => ({
        ...prev,
        title: data.title || '',
      }));
      toast.success('Title generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate title');
    } finally {
      setGeneratingTitle(false);
    }
  };

  // Simplified generate Price function
  const handleGeneratePrice = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      toast.error('Please provide an image URL first');
      return;
    }

    setGeneratingPrice(true);

    try {
      const response = await fetch('/api/generate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: formData.imageUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate price');
      }

      setFormData(prev => ({
        ...prev,
        startingPrice: data.startingPrice || '',
      }));
      toast.success('Price generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate price');
    } finally {
      setGeneratingPrice(false);
    }
  };


  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add an item');
      return;
    }

    setLoading(true);
    try {
      const startingPrice = parseFloat(formData.startingPrice);

      const item = {
        ...formData,
        startingPrice,
        currentPrice: startingPrice,
        sellerId: user.uid,
        createdAt: Timestamp.now(),
        endTime: Timestamp.fromDate(new Date(formData.endTime)),
      };

      await addDoc(collection(db, 'items'), item);
      toast.success('Item added successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    } finally {
      setLoading(false);
    }
  };


  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-center">Please sign in to add items</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <a target="_blank" rel="noopener noreferrer">
        <img
          src="bidable.jpg.png"
          alt="Hush Bids Logo"
          className="fixed top-0 left-0 w-24 h-auto m-2 z-50"
        />
      </a>


      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl text-gray-800 font-bold mb-6 text-center">Add New Item</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image
            </label>
            <ImageUpload onImageSelect={(file) => setFormData(prev => ({ ...prev, image: file }))} />
          </div>

          {/* Description input with markdown preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <div className="mt-1 space-y-2">
              <div className="flex gap-2">
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                />
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generating || !formData.imageUrl}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 h-fit whitespace-nowrap"
                >
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
              {formData.description && (
                <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                  <ReactMarkdown
                    className="text-gray-600"
                    components={{
                      // Customize markdown components if needed
                      p: ({children}) => <p className="mb-2">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                      li: ({children}) => <li className="mb-1">{children}</li>,
                      h1: ({children}) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                      h3: ({children}) => <h3 className="text-md font-bold mb-2">{children}</h3>,
                      strong: ({children}) => <strong className="font-bold">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                    }}
                  >
                    {formData.description}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {/* Summary field with generate button */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Summary (for gallery view)</label>

            <div className="flex gap-2">
              <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => updateFormData('summary', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  maxLength={100}
              />
              <button
                  type="button"
                  onClick={generateSummary}
                  className="mt-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
              >
                Generate Summary
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {formData.summary.length}/100 characters
            </p>
          </div>

          {/* Other form fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <div className="flex gap-2">
              <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                  type="button"
                  onClick={handleGenerateTitle}
                  disabled={generatingTitle || !formData.imageUrl}
                  className="mt-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
              >
                {generatingTitle ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Starting Price ($)</label>
            <div className="flex gap-2">
              <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.startingPrice}
                  onChange={(e) => updateFormData('startingPrice', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                  type="button"
                  onClick={handleGeneratePrice}
                  disabled={generatingPrice || !formData.imageUrl}
                  className="mt-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
              >
                {generatingPrice ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">End Date and Time</label>
            <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => updateFormData('endTime', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-gray-800 px-4 py-2 rounded-md  hover:text-yellow-50 hover:bg-gray-700 disabled:bg-blue-300"
          >
            {loading ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  );
}