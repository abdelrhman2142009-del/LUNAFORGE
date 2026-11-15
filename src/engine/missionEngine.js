export function calculateResources(selectedComponents) {
  let totalMass = 0;
  let totalPower = 0;
  let totalCost = 0;

  selectedComponents.forEach(c => {
    totalMass += c.mass || 0;
    totalPower += c.power || 0;
    totalCost += c.cost || 0;
  });

  return { totalMass, totalPower, totalCost, storageUsed: 0, isValid: true, warnings: [] };
}

export function validateMission(resources, mission) {
  const massValid = resources.totalMass <= mission.constraints.maxMass;
  const budgetValid = resources.totalCost <= mission.constraints.maxBudget;
  
  return {
    massValid,
    budgetValid,
    powerValid: true,
    storageValid: true,
    isValid: massValid && budgetValid,
    warnings: massValid ? [] : ["Too heavy!"]
  };
}
