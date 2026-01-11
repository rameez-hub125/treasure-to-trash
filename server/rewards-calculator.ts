// Reward points calculation engine

export type WasteType = "Foodwaste" | "Electroicwaste" |  "other";

interface PointCalculationInput {
  wasteType: WasteType;
  amount: number;
  isFrequentUser: boolean;
  submissionCount: number;
}

// Base points per waste type
const WASTE_TYPE_MULTIPLIERS: Record<WasteType, number> = {
  Foodwaste: 10,      // 10 points per kg
  Electroicwaste: 15,        // 15 points per kg (more valuable)
  other: 6,         // 6 points per kg
};

// Frequency bonus: 5% bonus for every 5 reports
const FREQUENCY_BONUS_THRESHOLD = 5;
const FREQUENCY_BONUS_PERCENT = 5;

// Quantity bonus: 10% bonus for reports >= 50kg
const QUANTITY_BONUS_THRESHOLD = 50;
const QUANTITY_BONUS_PERCENT = 10;

/**
 * Calculate reward points for a waste report
 * @param input - Calculation input parameters
 * @returns Calculated points and breakdown
 */
export function calculateRewardPoints(input: PointCalculationInput) {
  const { wasteType, amount, submissionCount } = input;

  // Base points = waste type multiplier × amount
  const baseMultiplier = WASTE_TYPE_MULTIPLIERS[wasteType] || WASTE_TYPE_MULTIPLIERS.other;
  const basePoints = Math.round(baseMultiplier * amount);

  // Quantity bonus (10% for 50kg+)
  let quantityBonusPoints = 0;
  if (amount >= QUANTITY_BONUS_THRESHOLD) {
    quantityBonusPoints = Math.round((basePoints * QUANTITY_BONUS_PERCENT) / 100);
  }

  // Frequency bonus (5% per 5 reports)
  let frequencyBonusPoints = 0;
  const frequencyMultiplier = Math.floor(submissionCount / FREQUENCY_BONUS_THRESHOLD);
  if (frequencyMultiplier > 0) {
    const bonusPercentage = frequencyMultiplier * FREQUENCY_BONUS_PERCENT;
    frequencyBonusPoints = Math.round((basePoints * bonusPercentage) / 100);
  }

  const totalPoints = basePoints + quantityBonusPoints + frequencyBonusPoints;

  return {
    totalPoints,
    basePoints,
    quantityBonusPoints,
    frequencyBonusPoints,
    breakdown: {
      wasteType,
      amount,
      multiplier: baseMultiplier,
      submissionCount,
      frequencyLevel: frequencyMultiplier,
    },
  };
}

/**
 * Calculate user level based on points
 */
export function calculateLevel(totalPoints: number): number {
  if (totalPoints >= 5000) return 5;
  if (totalPoints >= 3000) return 4;
  if (totalPoints >= 1500) return 3;
  if (totalPoints >= 500) return 2;
  return 1;
}
