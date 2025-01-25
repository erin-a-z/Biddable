export const sampleItems = [
  {
    title: "Vintage Watch",
    description: "A beautiful vintage timepiece in excellent condition",
    startingPrice: 100,
    currentPrice: 100,
    imageUrl: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800",
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    sellerId: "system",
    status: "active",
    createdAt: new Date()
  },
  {
    title: "Modern Art Painting",
    description: "Original abstract painting by emerging artist",
    startingPrice: 500,
    currentPrice: 500,
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    sellerId: "system",
    status: "active",
    createdAt: new Date()
  }
]; 