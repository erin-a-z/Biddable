import { Timestamp } from 'firebase/firestore';

export interface Item {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  currentPrice: number;
  startingPrice: number;
  endTime: Timestamp | Date;
  createdAt: Timestamp | Date;
  sellerId: string;
  highestBidderId?: string;
}

export interface Bid {
  id: string;
  itemId: string;
  userId: string;
  userEmail: string;
  amount: number;
  createdAt: Date | Timestamp;
}

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
} 