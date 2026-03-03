import Phaser from 'phaser';
import { IsometricUtils } from '../utils/IsometricUtils';
import { IsometricTree } from './IsometricTree';
import { TreeSpecies, getTreeType } from '../types/TreeTypes';

export interface TreeData {
  id: string;
  x: number;          // grid column (gx)
  y: number;          // grid row    (gy)
  age: number;        // days since planting
  species: TreeSpecies;
  playerName: string;
  plantedAt: number;  // Date.now() timestamp
}

export class Tree extends Phaser.GameObjects.Container {
  public treeData: TreeData;
  private sprite: Phaser.GameObjects.Graphics;
  private ageText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, data: TreeData) {
    const wp = IsometricUtils.gridToWorld(data.x, data.y);
    super(scene, wp.x, wp.y);

    this.treeData = data;

    const size = this.getTreeSize();
    const cfg  = getTreeType(data.species);

    this.sprite = IsometricTree.createTreeGraphics(scene, size, cfg);
    this.add(this.sprite);

    // Age label above the canopy
    this.ageText = scene.add.text(0, -size - 18, `${data.age}d`, {
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 3, y: 2 },
    });
    this.ageText.setOrigin(0.5, 1);
    this.add(this.ageText);

    this.setDepth(IsometricUtils.getDepth(data.x, data.y));
    scene.add.existing(this);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private getTreeSize(): number {
    // Different species have slightly different max sizes
    const maxSize: Record<TreeSpecies, number> = {
      oak:    80,
      pine:   90,   // tall
      palm:   85,   // tall but narrow
      cherry: 70,
      birch:  65,   // slender
    };
    const min = 36, max = maxSize[this.treeData.species] ?? 80, maxAge = 365;
    return min + (max - min) * Math.min(this.treeData.age / maxAge, 1);
  }

  // ── Public API ──────────────────────────────────────────────────────────

  public getCO2Contribution(): number {
    const cfg = getTreeType(this.treeData.species);
    return (this.treeData.age / 365) * cfg.co2PerYear;
  }

  public updateAge(currentTime: number, timeMultiplier: number): void {
    const elapsedMs = currentTime - this.treeData.plantedAt;
    this.treeData.age = Math.floor((elapsedMs / 1000) * timeMultiplier);

    const size = this.getTreeSize();
    const cfg  = getTreeType(this.treeData.species);

    this.remove(this.sprite);
    this.sprite.destroy();
    this.sprite = IsometricTree.createTreeGraphics(this.scene, size, cfg);
    this.add(this.sprite);

    this.ageText.setText(`${this.treeData.age}d`);
    this.ageText.setPosition(0, -size - 18);
  }

  public getWorldPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
