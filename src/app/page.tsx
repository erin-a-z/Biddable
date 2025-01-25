'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Item } from '@/types';
import ItemCard from '@/components/ItemCard';
import Link from 'next/link';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Item[];
      setItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-gray-500">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Live Auctions
            </h1>
            <p className="text-lg text-gray-600">
              Discover unique items and join the bidding excitement
            </p>
          </div>
          <Link 
            href="/items/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
              transition-all duration-200 transform hover:scale-105 shadow-md 
              hover:shadow-lg flex items-center gap-1.5 text-sm font-medium"
          >
            <span>Add New Item</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="max-w-md mx-auto">
              <p className="text-gray-500 text-lg">No active auctions at the moment.</p>
              <p className="text-gray-400 mt-2">Be the first to list an item!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {items.map((item) => (
              <div key={item.id} className="transform hover:-translate-y-1 transition-all duration-200 h-full w-md">
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 