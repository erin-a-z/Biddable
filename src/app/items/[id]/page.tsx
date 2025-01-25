'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Item, Bid } from '@/types';
import toast from 'react-hot-toast';
import Image from 'next/image';
import moment from 'moment';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function ItemPage() {
  const [user] = useAuthState(auth);
  const params = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const itemRef = doc(db, 'items', params.id as string);
    const unsubscribe = onSnapshot(itemRef, (doc) => {
      if (doc.exists()) {
        setItem({ id: doc.id, ...doc.data() } as Item);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching item:', error);
      toast.error('Error loading item details');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.id]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !item) return;

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= item.currentPrice) {
      toast.error(`Bid must be higher than current price: $${item.currentPrice}`);
      return;
    }

    try {
      // Start a loading state
      toast.loading('Placing your bid...');

      // Create the bid document
      const bid: Omit<Bid, 'id'> = {
        itemId: item.id,
        userId: user.uid,
        amount: bidValue,
        createdAt: new Date().toISOString(),
        userEmail: user.email || 'Anonymous'
      };

      // Add the bid to the bids collection
      await addDoc(collection(db, 'bids'), bid);

      // Update the item's current price
      const itemRef = doc(db, 'items', item.id);
      await updateDoc(itemRef, {
        currentPrice: bidValue
      });

      // Clear the input and show success message
      setBidAmount('');
      toast.dismiss();
      toast.success('Bid placed successfully!');
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.dismiss();
      toast.error('Failed to place bid. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Item not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Container */}
            <div className="h-[300px] relative bg-gray-50 p-4">
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={400}
                height={300}
                className="mx-auto h-full w-auto object-contain"
                priority
              />
            </div>

            {/* Details Container */}
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">{item.title}</h1>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-xl font-bold text-green-600 mb-2">
                  Current Price: ${item.currentPrice.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  Starting Price: ${item.startingPrice.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  Ends {moment(item.endTime).fromNow()}
                </p>
              </div>

              <p className="text-gray-600 mb-6">{item.description}</p>

              {user ? (
                <form onSubmit={handleBid} className="space-y-4">
                  <div>
                    <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">
                      Your Bid
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="bidAmount"
                        id="bidAmount"
                        step="0.01"
                        min={item.currentPrice + 0.01}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="block w-full pl-7 pr-12 py-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Min bid: $${(item.currentPrice + 0.01).toFixed(2)}`}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Place Bid
                  </button>
                </form>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-600">Please sign in to place a bid</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 