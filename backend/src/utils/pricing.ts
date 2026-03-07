export function calculateMinimumSellPrice(
  costPrice: number,
  marginPercentage: number
): number {
  return Number((costPrice * (1 + marginPercentage / 100)).toFixed(2));
}

