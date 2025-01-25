import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { sampleItems } from './sampleData';
import { serverTimestamp } from 'firebase/firestore';

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