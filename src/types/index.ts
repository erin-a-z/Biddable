export interface Item {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  currentPrice: number;
  startingPrice: number;
  endTime: Date;
  createdAt: Date;
  sellerId: string;
  highestBidderId?: string;
}

export interface Bid {
  id: string;
  itemId: string;
  userId: string;
  userEmail: string;
  amount: number;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
} 