// Reward points calculation engine

export type WasteType = "foodwaste" | "electronicwaste" | "electroicwaste" | "food" | "electronic" | "plastic" | "paper" | "glass" | "metal" | "other" | string;

interface PointCalculationInput {
  wasteType: WasteType;
  amount: number;
  isFrequentUser: boolean;
  submissionCount: number;
}

// Base points per waste type (supports multiple casing and aliases)
const WASTE_TYPE_MULTIPLIERS: Record<string, number> = {
  foodwaste: 10,
  food: 10,
  organic: 10,
  electronicwaste: 15,
  electroicwaste: 15,
  electronic: 15,
  "e-waste": 15,
  plastic: 8,
  paper: 8,
  glass: 8,
  metal: 12,
  other: 6,
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
  const normalizedKey = wasteType ? wasteType.toString().toLowerCase().trim() : "other";
  const baseMultiplier = WASTE_TYPE_MULTIPLIERS[normalizedKey] || WASTE_TYPE_MULTIPLIERS.other;
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
