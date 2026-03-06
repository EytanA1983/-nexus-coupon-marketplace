import { Decimal } from '@prisma/client/runtime/library';

/**
 * Calculate minimum sell price from cost price and margin percentage.
 * 
 * Formula: minimumSellPrice = costPrice * (1 + marginPercentage/100)
 * Rounded to 2 decimal places (money).
 * 
 * @param costPrice - The cost price of the product
 * @param marginPercentage - The margin percentage (e.g., 20 for 20%)
 * @returns The minimum sell price rounded to 2 decimal places
 */
export function calculateMinimumSellPrice(
  costPrice: number,
  marginPercentage: number
): number {
  return Number((costPrice * (1 + marginPercentage / 100)).toFixed(2));
}

/**
 * Compute minimumSellPrice from costPrice and marginPercentage (Decimal version).
 * 
 * @deprecated Use calculateMinimumSellPrice instead. This function is kept for backward compatibility.
 */
export function computeMinimumSellPrice(args: {
  costPrice: Decimal;
  marginPercentage: Decimal;
}): Decimal {
  const { costPrice, marginPercentage } = args;
  
  const costPriceNum = costPrice.toNumber();
  const marginPercentageNum = marginPercentage.toNumber();
  const result = calculateMinimumSellPrice(costPriceNum, marginPercentageNum);
  
  return new Decimal(result);
}

