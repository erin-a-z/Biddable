import { Timestamp } from 'firebase/firestore';

export interface Item {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startingPrice: number;
  currentPrice?: number;
  reservePrice?: number;
  endTime: Date | Timestamp;
  sellerId: string;
  createdAt: Date | Timestamp;
}

export interface Bid {
  id: string;
  amount: number;
  userId: string;
  userEmail: string;
  timestamp: Date | Timestamp;
  itemId: string;
}

// ... existing types ... 