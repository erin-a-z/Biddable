import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Item } from '@/types';
import moment from 'moment';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const router = useRouter();

  return (
    <Link href={`/items/${item.id}`} className="block h-full">
      <div className="item-card">
        <div className="unsplash-img-container">
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={300}
            height={180}
            className="unsplash-img rounded-t-lg"
            priority
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
                ${item.currentPrice.toFixed(2)}
              </p>
              <p className="text-gray-500 text-xs">
                Ends {moment(item.endTime).fromNow()}
              </p>
            </div>
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
              Bid Now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 