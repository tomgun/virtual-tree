import Phaser from 'phaser';
import { IsometricUtils } from '../utils/IsometricUtils';
import { IsometricTree } from './IsometricTree';

export interface TreeData {
  id: string;
  x: number;          // grid column (gx)
  y: number;          // grid row    (gy)
  age: number;        // days since planting
  species: string;
  playerName: string;
  plantedAt: number;  // Date.now() timestamp
}

export class Tree extends Phaser.GameObjects.Container {
  public treeData: TreeData;
  private sprite: Phaser.GameObjects.Graphics;
  private ageText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, data: TreeData) {
    // Position container at the world (screen) centre of the tile
    const wp = IsometricUtils.gridToWorld(data.x, data.y);
    super(scene, wp.x, wp.y);

    this.treeData = data;

    const size  = this.getTreeSize();
    const color = this.getTreeColor();

    this.sprite = IsometricTree.createTreeGraphics(scene, size, color);
    this.add(this.sprite);

    // Age label above the foliage
    this.ageText = scene.add.text(0, -size - 18, `${data.age}d`, {
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 3, y: 2 },
    });
    this.ageText.setOrigin(0.5, 1);
    this.add(this.ageText);

    // Isometric depth: tiles with higher (gx+gy) are "closer to camera"
    this.setDepth(IsometricUtils.getDepth(data.x, data.y));

    scene.add.existing(this);
  }

  // ── Size / colour helpers ───────────────────────────────────────────

  private getTreeSize(): number {
    const min = 36, max = 80, maxAge = 365;
    return min + (max - min) * Math.min(this.treeData.age / maxAge, 1);
  }

  private getTreeColor(): number {
    const r = Math.min(this.treeData.age / 365, 1);
    if (r < 0.33) return 0x90ee90; // young  – light green
    if (r < 0.66) return 0x32cd32; // mid    – lime green
    return 0x228b22;               // mature – forest green
  }

  // ── Public API ──────────────────────────────────────────────────────

  public getCO2Contribution(): number {
    // Simplified: mature tree absorbs ~22 kg CO₂/year
    return (this.treeData.age / 365) * 22;
  }

  public updateAge(currentTime: number, timeMultiplier: number): void {
    const elapsedMs = currentTime - this.treeData.plantedAt;
    this.treeData.age = Math.floor((elapsedMs / 1000) * timeMultiplier);

    // Replace sprite with updated size/colour
    const size  = this.getTreeSize();
    const color = this.getTreeColor();
    this.remove(this.sprite);
    this.sprite.destroy();
    this.sprite = IsometricTree.createTreeGraphics(this.scene, size, color);
    this.add(this.sprite);

    this.ageText.setText(`${this.treeData.age}d`);
    this.ageText.setPosition(0, -size - 18);
  }

  public getWorldPosition(): { x: number; y: number } {
    // Return the world (screen) position of this tree
    return { x: this.x, y: this.y };
  }
}
