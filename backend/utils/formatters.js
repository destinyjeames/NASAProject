/**
 * Safely converts a value to a finite number, returning 0 as fallback.
 */
export const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Calculates the average estimated diameter in meters from NASA's diameter range object.
 */
export const averageDiameter = (estimatedDiameter) => {
  const min = toNumber(estimatedDiameter?.meters?.estimated_diameter_min);
  const max = toNumber(estimatedDiameter?.meters?.estimated_diameter_max);
  if (!min && !max) return 0;
  return Number(((min + max) / 2).toFixed(2));
};
