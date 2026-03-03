import { TreeData } from '../entities/Tree';
import { getTreeType } from '../types/TreeTypes';

/**
 * CO₂ sequestration calculator.
 *
 * Model: a tree sequesters CO₂ linearly as it grows.
 * At age = 365 days (full maturity) it has absorbed `co2PerYear` kg.
 * Younger trees contribute proportionally less.
 *
 * Real-world references: Nowak & Crane (2002), UK Woodland Carbon Code,
 * US Forest Service i-Tree data.
 */
export class CO2Calculator {
  private static readonly DAYS_PER_YEAR = 365;

  /** Total CO₂ absorbed across all trees (kg). */
  public calculateTotal(trees: TreeData[]): number {
    if (trees.length === 0) return 0;
    const total = trees.reduce((sum, tree) => sum + this.calculateForTree(tree), 0);
    return Math.round(total * 100) / 100;
  }

  /** CO₂ absorbed by a single tree at its current growth stage (kg). */
  public calculateForTree(tree: TreeData): number {
    const cfg = getTreeType(tree.species);
    const fraction = Math.min(tree.age / CO2Calculator.DAYS_PER_YEAR, 1);
    return Math.round(fraction * cfg.co2PerYear * 100) / 100;
  }

  /** Human-readable score: "X.XX kg CO₂" or "X.XX t CO₂". */
  public formatScore(score: number): string {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(2)} t CO₂`;
    }
    return `${score.toFixed(2)} kg CO₂`;
  }
}
