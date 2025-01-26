'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { Item } from '@/types';

export default function EditItemPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    startingPrice: '',
    endTime: '',
  });

  useEffect(() => {
    const fetchItem = async () => {
      if (!params.id) return;

      try {
        const docRef = doc(db, 'items', params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const item = docSnap.data() as Item;
          if (user?.uid !== item.sellerId) {
            toast.error('Unauthorized');
            router.push('/');
            return;
          }

          const endTime = item.endTime instanceof Timestamp 
            ? item.endTime.toDate() 
            : new Date(item.endTime);

          setFormData({
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            startingPrice: item.startingPrice.toString(),
            endTime: endTime.toISOString().slice(0, 16),
          });
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Error loading item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [params.id, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const itemRef = doc(db, 'items', params.id as string);
      
      await updateDoc(itemRef, {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        endTime: Timestamp.fromDate(new Date(formData.endTime)),
      });

      toast.success('Item updated successfully!');
      router.push(`/items/${params.id}`);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Item</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date and Time</label>
            <input
              type="datetime-local"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Updating...' : 'Update Item'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 