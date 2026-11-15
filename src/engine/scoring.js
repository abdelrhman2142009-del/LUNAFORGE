export function calculateScore(validation) {
  let score = 0;
  if (validation.massValid) score += 25;
  if (validation.budgetValid) score += 25;
  if (validation.powerValid) score += 25;
  if (validation.isValid) score += 25;
  return score;
}
