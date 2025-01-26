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

  const colors = [
    'ring-red-500',
    'ring-blue-500',
    'ring-green-500',
    'ring-yellow-500',
    'ring-purple-500',
    'ring-pink-500',
    'ring-orange-500',
    'ring-teal-500',
  ];

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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
          <p className="text-gray-400">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.3.1/css/all.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css"
        />
      </head>
      <a href="https://imgur.com/gallery/biddable-part-2-rvXoLdv" target="_blank" rel="noopener noreferrer">
        <img
          src="bidable.jpg.png"
          alt="Hush Bids Logo"
          className="fixed top-0 left-0 w-12 h-auto m-2 z-50"
        />
      </a>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Live Auctions
            </h1>
            <p className="text-base md:text-lg text-gray-400 leading-relaxed">
              Step into the dynamic world of live auctions where treasures await! From rare
              collectibles to luxury goods and one-of-a-kind creations, there's something special for everyone.
            </p>
          </div>
          <Link
            href="/items/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700
              transition-all duration-200 transform hover:scale-105 shadow-md
              hover:shadow-lg flex items-center gap-2 text-sm font-medium"
          >
            Add New Item
          </Link>
        </div>

        {/* Auctions */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-2xl shadow-sm">
            <div className="max-w-md mx-auto">
              <p className="text-gray-400 text-lg">
                No active auctions at the moment.
              </p>
              <p className="text-gray-500 mt-2">Be the first to list an item!</p>
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors[index % colors.length]} ring-4`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: '100%',
                  minHeight: '250px',
                }}
              >
                {/* Content Below the Image */}
                <div className="flex flex-col justify-center items-center mt-4">
                  <ItemCard item={item} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}