export function getMinimumBidIncrement(currentPrice: number): number {
  if (currentPrice <= 0) return 0.01;
  if (currentPrice <= 0.99) return 0.05;
  if (currentPrice <= 2.49) return 0.10;
  if (currentPrice <= 4.99) return 0.25;
  if (currentPrice <= 9.99) return 0.50;
  if (currentPrice <= 24.99) return 1.00;
  if (currentPrice <= 49.99) return 2.50;
  if (currentPrice <= 99.99) return 5.00;
  if (currentPrice <= 249.99) return 7.50;
  if (currentPrice <= 499.99) return 10.00;
  if (currentPrice <= 999.99) return 25.00;
  if (currentPrice <= 2499.99) return 50.00;
  if (currentPrice <= 4999.99) return 75.00;
  if (currentPrice <= 9999.99) return 100.00;
  if (currentPrice <= 24999.99) return 250.00;
  return 500.00;
} 