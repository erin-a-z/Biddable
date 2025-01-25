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
        
        if (item && item.highestBidderId === user.uid && newItem.highestBidderId !== user.uid && newItem.highestBidderId !== undefined) {
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

      const itemRef = doc(db, 'items', item.id!);
      await updateDoc(itemRef, {
        currentPrice: bidValue,
        highestBidderId: user.uid
      });

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Item not found</div>
      </div>
    );
  }

  const endTime = item.endTime instanceof Timestamp ? item.endTime.toDate() : new Date(item.endTime);
  const isEnded = endTime < new Date();

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          <section className="grid grid-cols-1 md:grid-cols-2">
            <figure className="text-center img-container aspect-w-16 aspect-h-9">
              <img
                src={item.imageUrl.includes('images.unsplash.com') 
                  ? `${item.imageUrl.split('?')[0]}?q=80&w=600&auto=format&fit=crop`
                  : item.imageUrl}
                alt={item.title}
                className="max-h-full w-full object-cover block"
                loading="lazy"
              />
            </figure>

            <div className="p-8 flex flex-col gap-6 items-center">
              <h1 className="text-3xl font-bold text-gray-900 text-center">{item.title}</h1>
              
              <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-center w-full">
                <p className="text-2xl font-bold text-green-600">
                  ${(item.currentPrice || item.startingPrice).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Starting Price: ${item.startingPrice.toFixed(2)}
                </p>
                {item.reservePrice && (
                  <>
                    {user?.uid === item.sellerId ? (
                      <p className="text-sm text-gray-600">
                        Reserve Price: ${item.reservePrice.toFixed(2)}
                      </p>
                    ) : (
                      <p className={`text-sm font-medium ${(item.currentPrice || item.startingPrice) >= item.reservePrice ? 'text-green-600' : 'text-amber-600'}`}>
                        {(item.currentPrice || item.startingPrice) >= item.reservePrice ? 
                          '✓ Reserve Price Met' : 
                          '⚠ Reserve Price Not Met'
                        }
                      </p>
                    )}
                  </>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <p className={`${isEnded ? 'text-red-600' : 'text-gray-700'} font-medium`}>
                    {isEnded ? (
                      'Auction Ended'
                    ) : (
                      <>
                        Ends {moment(endTime).format('MMMM D, YYYY')} at {moment(endTime).format('h:mm A z')}
                        <span className="block text-sm text-gray-500 mt-1">
                          ({moment(endTime).fromNow()})
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{item.description}</p>

              {!isEnded && user ? (
                <form onSubmit={handleBid} className="space-y-4">
                  <div>
                    <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Bid
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        name="bidAmount"
                        id="bidAmount"
                        step="0.01"
                        min={(item.currentPrice || item.startingPrice) + getMinimumBidIncrement(item.currentPrice || item.startingPrice)}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="block w-full pl-8 pr-12 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Min bid: $${((item.currentPrice || item.startingPrice) + getMinimumBidIncrement(item.currentPrice || item.startingPrice)).toFixed(2)}`}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Place Bid
                  </button>
                </form>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    {isEnded ? 'The auction has ended. Bidding is closed.' : 'Please sign in to place a bid'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </article>

        {user && user.uid === item.sellerId && (
          <div className="space-y-8 mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex gap-4">
                <Link
                  href={`/items/${item.id}/edit`}
                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
                >
                  Edit Listing
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  Delete Listing
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <BidHistory itemId={params.id as string} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 