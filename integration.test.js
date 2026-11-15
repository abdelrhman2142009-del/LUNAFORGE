import { describe, it, expect } from 'vitest';
import { calculateResources, validateMission } from './src/engine/missionEngine.js';

describe('LUNAFORGE - Integration Test', () => {
  it('calculates total mass, power, and cost correctly', () => {
    const mockComponents = [
      { mass: 1.5, power: 2, cost: 100 },
      { mass: 2.0, power: 5, cost: 200 }
    ];
    
    const result = calculateResources(mockComponents);
    
    expect(result.totalMass).toBe(3.5);
    expect(result.totalPower).toBe(7);
    expect(result.totalCost).toBe(300);
  });

  it('validates mission constraints correctly', () => {
    const mockResources = { totalMass: 6, totalCost: 800 };
    const mockMission = { 
      constraints: { maxMass: 5, maxBudget: 1000 } 
    };
    
    const validation = validateMission(mockResources, mockMission);
    
    expect(validation.massValid).toBe(false); // 6 is greater than 5
    expect(validation.budgetValid).toBe(true); // 800 is less than 1000
    expect(validation.isValid).toBe(false);
  });
});
