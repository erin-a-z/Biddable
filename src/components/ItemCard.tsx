import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Item } from '@/types';
import moment from 'moment';
import { Timestamp } from 'firebase/firestore';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const router = useRouter();
  // Convert Firestore Timestamp to Date
  const endTime = item.endTime instanceof Timestamp ? item.endTime.toDate() : new Date(item.endTime);
  const isEnded = endTime < new Date();

  return (
    <Link href={`/items/${item.id}`} className="block h-full w-full">
      <div className="item-card w-full max-w-sm border rounded-lg shadow">
        <div className="unsplash-img-container aspect-[4/3] overflow-hidden">
          <img
            src={item.imageUrl.includes('images.unsplash.com') 
              ? `${item.imageUrl.split('?')[0]}?q=80&w=300&auto=format&fit=crop`
              : item.imageUrl}
            alt={item.title}
            className="unsplash-img rounded-t-lg w-full h-full object-cover"
          />
        </div>
        <div className="item-card-content">
          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
            {item.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {item.description}
          </p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-green-600 font-bold text-sm">
                ${item.currentPrice?.toFixed(2) || item.startingPrice.toFixed(2)}
              </p>
              <p className={`text-xs ${isEnded ? 'text-red-500' : 'text-gray-500'}`}>
                {isEnded ? 'Auction Ended' : (
                  <>
                    Ends {moment(endTime).format('MMM D, h:mm A')}
                    <br />
                    <span className="text-gray-400">
                      ({moment(endTime).fromNow()})
                    </span>
                  </>
                )}
              </p>
            </div>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
              ${isEnded ? 'bg-gray-50 text-gray-600' : 'bg-blue-50 text-blue-600'}`}>
              {isEnded ? 'Ended' : 'Bid Now →'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 