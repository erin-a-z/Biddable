'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bid } from '@/types';
import moment from 'moment';

interface BidHistoryProps {
  itemId: string;
}

export default function BidHistory({ itemId }: BidHistoryProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'bids'),
      where('itemId', '==', itemId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bidData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bid[];
      setBids(bidData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [itemId]);

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Bid History</h3>
        <div className="text-gray-500">Loading bids...</div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Bid History</h3>
        <div className="text-gray-500">No bids yet</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Bid History</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bidder
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bids.map((bid) => (
              <tr key={bid.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bid.userEmail.split('@')[0]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${bid.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {moment(bid.timestamp instanceof Date ? bid.timestamp : bid.timestamp.toDate()).fromNow()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 