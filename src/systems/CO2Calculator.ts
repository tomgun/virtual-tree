import { TreeData } from '../entities/Tree';

/**
 * System for calculating CO2 scores
 */
export class CO2Calculator {
  /**
   * Calculate total CO2 score for all trees
   */
  public calculateTotal(trees: TreeData[]): number {
    if (trees.length === 0) return 0;

    const total = trees.reduce((sum, tree) => {
      const kgPerYear = 22;
      const daysPerYear = 365;
      const contribution = (tree.age / daysPerYear) * kgPerYear;
      return sum + contribution;
    }, 0);

    return Math.round(total * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calculate CO2 score for a single tree
   */
  public calculateForTree(tree: TreeData): number {
    const kgPerYear = 22;
    const daysPerYear = 365;
    return Math.round((tree.age / daysPerYear) * kgPerYear * 100) / 100;
  }

  /**
   * Format CO2 score for display
   */
  public formatScore(score: number): string {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(2)}t CO₂`;
    }
    return `${score.toFixed(2)}kg CO₂`;
  }
}
