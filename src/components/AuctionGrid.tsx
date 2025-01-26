'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Item } from '@/types';
import dynamic from 'next/dynamic';

const ItemCard = dynamic(() => import('./ItemCard'), {
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-64"></div>
});

export default function AuctionGrid() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Item[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="pb-20 sm:pb-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 p-4 auto-rows-min">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col min-h-[400px] transform transition-all duration-200 hover:scale-[1.02]">
            <ItemCard item={item} />
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">No active auctions at the moment.</p>
            <p className="text-gray-500 mt-2">Be the first to list an item!</p>
          </div>
        )}
      </div>
    </div>
  );
} 