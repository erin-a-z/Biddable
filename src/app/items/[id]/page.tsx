'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot, deleteDoc, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Item, Bid } from '@/types';
import toast from 'react-hot-toast';
import Image from 'next/image';
import moment from 'moment';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import BidHistory from '@/components/BidHistory';
import { getMinimumBidIncrement } from '@/utils/bidding';

export default function ItemPage() {
  const [user] = useAuthState(auth);
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id || !user) return;

    const itemRef = doc(db, 'items', params.id as string);
    const unsubscribe = onSnapshot(itemRef, (doc) => {
      if (doc.exists()) {
        const newItem = { id: doc.id, ...doc.data() } as Item;
        setItem(newItem);
        
        // Show outbid notification if user was previously highest bidder but isn't anymore
        if (item && // Previous item state exists
            item.highestBidderId === user.uid && // User was highest bidder
            newItem.highestBidderId !== user.uid && // User is no longer highest bidder
            newItem.highestBidderId !== undefined) { // Someone else has bid
          toast.custom((t: { visible: boolean }) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-amber-50 border-l-4 border-amber-500 p-4`}>
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    You've been outbid on {newItem.title}!
                    <br />
                    New highest bid: ${(newItem.currentPrice || newItem.startingPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ), {
            id: `outbid-${user.uid}`,
            duration: 5000
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.id, user]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !item) return;

    const bidValue = parseFloat(bidAmount);
    const currentPrice = item.currentPrice || item.startingPrice;
    const minIncrement = getMinimumBidIncrement(currentPrice);
    const minimumBid = currentPrice + minIncrement;
    
    if (isNaN(bidValue) || bidValue < minimumBid) {
      toast.error(`Minimum bid must be $${minimumBid.toFixed(2)} (${minIncrement.toFixed(2)} more than current bid)`);
      return;
    }

    try {
      toast.loading('Placing your bid...');

      // Get the current highest bidder before updating
      const bidsRef = collection(db, 'bids');
      const q = query(bidsRef, 
        where('itemId', '==', item.id),
        orderBy('amount', 'desc'),
        limit(1)
      );
      const highestBidSnap = await getDocs(q);
      const highestBid = highestBidSnap.docs[0]?.data() as Bid | undefined;

      const bid: Omit<Bid, 'id'> = {
        itemId: item.id!,
        userId: user.uid,
        amount: bidValue,
        timestamp: new Date(),
        userEmail: user.email || 'Anonymous'
      };

      await addDoc(collection(db, 'bids'), bid);

      // Update item with new price and track highest bidder
      const itemRef = doc(db, 'items', item.id!);
      await updateDoc(itemRef, {
        currentPrice: bidValue,
        highestBidderId: user.uid
      });

      // Notify current user if they were the previous highest bidder
      if (highestBid && highestBid.userId === user.uid) {
        toast.custom((t: { visible: boolean }) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-amber-50 border-l-4 border-amber-500 p-4`}>
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  You've been outbid on {item.title}!
                  <br />
                  New highest bid: ${(item.currentPrice || item.startingPrice).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ), {
          id: `outbid-${user.uid}`,
          duration: 5000
        });
      }

      setBidAmount('');
      toast.dismiss();
      
      if (item.reservePrice && bidValue >= item.reservePrice) {
        toast.success('Bid placed successfully! Reserve price has been met!');
      } else {
        toast.success('Bid placed successfully!');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.dismiss();
      toast.error('Failed to place bid. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      toast.loading('Deleting item...');
      await deleteDoc(doc(db, 'items', params.id as string));
      toast.dismiss();
      toast.success('Item deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.dismiss();
      toast.error('Failed to delete item');
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

  const endTime = item.endTime instanceof Timestamp ? item.endTime.toDate() : new Date(item.endTime);
  const isEnded = endTime < new Date();

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
                  Current Price: ${item.currentPrice?.toFixed(2) || item.startingPrice.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  Starting Price: ${item.startingPrice.toFixed(2)}
                </p>
                {item.reservePrice && (
                  ((item.currentPrice || item.startingPrice) >= item.reservePrice || user?.uid === item.sellerId) && (
                    <p className={`text-sm mt-2 ${(item.currentPrice || item.startingPrice) >= item.reservePrice ? 'text-green-600' : 'text-amber-600'}`}>
                      {(item.currentPrice || item.startingPrice) >= item.reservePrice ? 
                        '✓ Reserve Price Met' : 
                        '⚠ Reserve Price Not Met'
                      }
                    </p>
                  )
                )}
                <div className="mt-2 border-t pt-2">
                  <p className={`${isEnded ? 'text-red-500' : 'text-gray-600'}`}>
                    {isEnded ? (
                      'Auction Ended'
                    ) : (
                      <>
                        Ends on {moment(endTime).format('MMMM D, YYYY')}
                        <br />
                        at {moment(endTime).format('h:mm A z')}
                        <br />
                        <span className="text-sm text-gray-500">
                          ({moment(endTime).fromNow()})
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{item.description}</p>

              {user && user.uid === item.sellerId && (
                <div className="flex gap-4 mb-6">
                  <Link
                    href={`/items/${item.id}/edit`}
                    className="flex-1 bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 text-center"
                  >
                    Edit Listing
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded-md hover:bg-red-200"
                  >
                    Delete Listing
                  </button>
                </div>
              )}

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
                        min={(item.currentPrice || item.startingPrice) + getMinimumBidIncrement(item.currentPrice || item.startingPrice)}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="block w-full pl-7 pr-12 py-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Min bid: $${((item.currentPrice || item.startingPrice) + getMinimumBidIncrement(item.currentPrice || item.startingPrice)).toFixed(2)}`}
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

        {/* Add bid history component */}
        <BidHistory itemId={params.id as string} />
      </div>
    </div>
  );
} 