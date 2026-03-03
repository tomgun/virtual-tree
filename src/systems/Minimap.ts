import Phaser from 'phaser';
import { Tree } from '../entities/Tree';

/**
 * Minimap system for navigation
 */
export class Minimap {
  private scene: Phaser.Scene;
  private minimapContainer?: Phaser.GameObjects.Container;
  private minimapGraphics?: Phaser.GameObjects.Graphics;
  private viewportRect?: Phaser.GameObjects.Rectangle;
  private treeDots: Phaser.GameObjects.Arc[] = [];
  private terrainSize: number;
  private minimapSize: number = 200;
  private minimapScale: number = 1;

  constructor(scene: Phaser.Scene, terrainSize: number) {
    this.scene = scene;
    this.terrainSize = terrainSize;
    this.minimapScale = this.minimapSize / terrainSize;
  }

  /**
   * Create the minimap UI
   */
  public create(x: number, y: number): void {
    // Create container for minimap
    this.minimapContainer = this.scene.add.container(x, y);
    this.minimapContainer.setScrollFactor(0); // Fixed to camera

    // Background
    const bg = this.scene.add.rectangle(0, 0, this.minimapSize + 10, this.minimapSize + 10, 0x000000, 0.7);
    bg.setStrokeStyle(2, 0xffffff);
    this.minimapContainer.add(bg);

    // Minimap graphics for terrain
    this.minimapGraphics = this.scene.add.graphics();
    this.minimapGraphics.fillStyle(0x2d5016, 0.5);
    this.minimapGraphics.fillRect(-this.minimapSize / 2, -this.minimapSize / 2, this.minimapSize, this.minimapSize);
    this.minimapContainer.add(this.minimapGraphics);

    // Viewport rectangle (shows current camera view)
    this.viewportRect = this.scene.add.rectangle(0, 0, 0, 0, 0xffffff, 0.3);
    this.viewportRect.setStrokeStyle(2, 0xffff00);
    this.minimapContainer.add(this.viewportRect);

    // Label
    const label = this.scene.add.text(0, -this.minimapSize / 2 - 15, 'Minimap', {
      fontSize: '14px',
      color: '#ffffff',
    });
    label.setOrigin(0.5, 1);
    this.minimapContainer.add(label);

    // Make minimap clickable for navigation
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleMinimapClick(pointer);
    });
  }

  /**
   * Update minimap with current trees and camera position
   */
  public update(trees: Tree[], camera: Phaser.Cameras.Scene2D.Camera): void {
    if (!this.minimapContainer || !this.minimapGraphics) return;

    // Clear existing tree dots
    this.treeDots.forEach((dot) => dot.destroy());
    this.treeDots = [];

    // Draw trees as dots
    trees.forEach((tree) => {
      const pos = tree.getWorldPosition();
      const minimapX = (pos.x * this.minimapScale) - this.minimapSize / 2;
      const minimapY = (pos.y * this.minimapScale) - this.minimapSize / 2;

      // Only draw if within minimap bounds
      if (minimapX >= -this.minimapSize / 2 && minimapX <= this.minimapSize / 2 &&
          minimapY >= -this.minimapSize / 2 && minimapY <= this.minimapSize / 2) {
        const dot = this.scene.add.circle(
          minimapX,
          minimapY,
          2,
          tree.treeData.age > 30 ? 0x228b22 : 0x90ee90 // Darker green for older trees
        );
        dot.setScrollFactor(0);
        this.minimapContainer!.add(dot);
        this.treeDots.push(dot);
      }
    });

    // Update viewport rectangle
    if (this.viewportRect) {
      const viewportWidth = (camera.width * this.minimapScale);
      const viewportHeight = (camera.height * this.minimapScale);
      const viewportX = (camera.scrollX * this.minimapScale) - this.minimapSize / 2;
      const viewportY = (camera.scrollY * this.minimapScale) - this.minimapSize / 2;

      this.viewportRect.setSize(viewportWidth, viewportHeight);
      this.viewportRect.setPosition(viewportX, viewportY);
    }
  }

  /**
   * Handle click on minimap to navigate
   */
  private handleMinimapClick(pointer: Phaser.Input.Pointer): void {
    if (!this.minimapContainer) return;

    // Get local coordinates relative to minimap center
    const localX = pointer.x - this.minimapContainer.x;
    const localY = pointer.y - this.minimapContainer.y;

    // Convert to world coordinates
    const worldX = (localX + this.minimapSize / 2) / this.minimapScale;
    const worldY = (localY + this.minimapSize / 2) / this.minimapScale;

    // Clamp to terrain bounds
    const clampedX = Phaser.Math.Clamp(worldX, 0, this.terrainSize);
    const clampedY = Phaser.Math.Clamp(worldY, 0, this.terrainSize);

    // Move camera to clicked position
    this.scene.cameras.main.centerOn(clampedX, clampedY);
  }

  /**
   * Toggle minimap visibility
   */
  public setVisible(visible: boolean): void {
    if (this.minimapContainer) {
      this.minimapContainer.setVisible(visible);
    }
  }
}
