import { TreeData } from '../entities/Tree';

export interface GameState {
  playerName: string;
  trees: TreeData[];
  lastUpdated: number;
  animalStressEventCount?: number;
  animalStressWeightedScore?: number;
}

/**
 * Manages LocalStorage persistence
 */
export class StorageManager {
  private static readonly STORAGE_KEY = 'virtual-tree-game-state';

  /**
   * Save game state to LocalStorage
   */
  public static save(state: GameState): void {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save game state:', error);
      throw new Error(`Storage save failed: ${error}`);
    }
  }

  /**
   * Load game state from LocalStorage
   */
  public static load(): GameState | null {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (!serialized) return null;

      const state = JSON.parse(serialized) as GameState;
      return state;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }

  /**
   * Clear saved game state
   */
  public static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear game state:', error);
    }
  }

  /**
   * Check if storage is available
   */
  public static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
