import Phaser from 'phaser';
import { Animal, AnimalSpecies } from '../entities/Animal';
import { Tree } from '../entities/Tree';
import { IsometricUtils, GRID_COLS, GRID_ROWS, TILE_W, TILE_H } from '../utils/IsometricUtils';

const TREES_PER_ANIMAL = 10;
const SPECIES: AnimalSpecies[] = ['mouse', 'ant', 'bug'];

/**
 * Spawns and manages small forest animals.
 * Population = floor(treeCount / TREES_PER_ANIMAL).
 * Call sync() whenever the tree list changes, update() every frame.
 */
export class AnimalManager {
  private scene: Phaser.Scene;
  private animals: Animal[] = [];

  // World bounds
  private readonly worldW = (GRID_COLS + GRID_ROWS) * (TILE_W / 2);
  private readonly worldH = (GRID_COLS + GRID_ROWS) * (TILE_H / 2);

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Adjust population to match 1 animal per TREES_PER_ANIMAL trees. */
  sync(trees: Tree[]): void {
    const target = Math.floor(trees.length / TREES_PER_ANIMAL);

    while (this.animals.length < target) {
      this.spawnNear(trees);
    }
    while (this.animals.length > target) {
      this.animals.pop()!.destroy();
    }
  }

  /** Call every frame from MainScene.update(). */
  update(delta: number, trees: Tree[]): void {
    if (this.animals.length === 0) return;
    const positions = trees.map(t => ({ x: t.x, y: t.y }));
    this.animals.forEach(a => a.update(delta, positions));
  }

  destroy(): void {
    this.animals.forEach(a => a.destroy());
    this.animals = [];
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private spawnNear(trees: Tree[]): void {
    let wx: number;
    let wy: number;

    if (trees.length > 0) {
      const anchor = trees[Math.floor(Math.random() * trees.length)];
      const spread = 200;
      wx = Phaser.Math.Clamp(anchor.x + (Math.random() - 0.5) * spread, 0, this.worldW);
      wy = Phaser.Math.Clamp(anchor.y + (Math.random() - 0.5) * spread, 0, this.worldH);
    } else {
      // Fallback: spawn near grid centre
      const mid = IsometricUtils.gridToWorld(GRID_COLS / 2, GRID_ROWS / 2);
      wx = mid.x + (Math.random() - 0.5) * 300;
      wy = mid.y + (Math.random() - 0.5) * 150;
    }

    const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    this.animals.push(new Animal(this.scene, wx, wy, species));
  }
}
