import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { sampleItems } from './sampleData';
import { serverTimestamp } from 'firebase/firestore';

const sampleItems = [
  {
    title: "Vintage Mechanical Watch",
    description: "A beautiful vintage mechanical watch from the 1960s. Perfect working condition.",
    imageUrl: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e",
    startingPrice: 150.00,
    currentPrice: 150.00,
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    sellerId: "ADMIN",
  },
  {
    title: "Professional DSLR Camera",
    description: "High-end DSLR camera with multiple lenses and accessories included.",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    startingPrice: 800.00,
    currentPrice: 800.00,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    sellerId: "ADMIN",
  },
  {
    title: "Antique Writing Desk",
    description: "Beautifully preserved mahogany writing desk from the Victorian era.",
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd",
    startingPrice: 500.00,
    currentPrice: 500.00,
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    sellerId: "ADMIN",
  }
];

export async function initializeFirestore() {
  const itemsRef = collection(db, 'items');
  const snapshot = await getDocs(itemsRef);
  
  if (snapshot.empty) {
    console.log('Populating database with sample items...');
    for (const item of sampleItems) {
      await addDoc(itemsRef, item);
    }
    console.log('Database populated!');
  }
}

export async function initializeItems() {
  try {
    const itemsCollection = collection(db, 'items');
    
    for (const item of sampleItems) {
      await addDoc(itemsCollection, {
        ...item,
        createdAt: serverTimestamp(),
      });
    }
    
    console.log('Sample items added successfully');
  } catch (error) {
    console.error('Error adding sample items:', error);
  }
} 