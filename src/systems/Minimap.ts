import Phaser from 'phaser';
import { Tree } from '../entities/Tree';

/**
 * Small overview map in the top-right corner.
 */
export class Minimap {
  private scene: Phaser.Scene;
  private worldW: number;
  private worldH: number;
  private readonly SIZE = 200; // minimap square size in pixels
  private scaleX: number;
  private scaleY: number;

  private container?: Phaser.GameObjects.Container;
  private viewport?: Phaser.GameObjects.Rectangle;
  private treeDots: Phaser.GameObjects.Arc[] = [];

  constructor(scene: Phaser.Scene, worldW: number, worldH: number) {
    this.scene = scene;
    this.worldW = worldW;
    this.worldH = worldH;
    this.scaleX = this.SIZE / worldW;
    this.scaleY = this.SIZE / worldH;
  }

  public create(cx: number, cy: number): void {
    this.container = this.scene.add.container(cx, cy);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);

    // Background
    const bg = this.scene.add.rectangle(0, 0, this.SIZE + 10, this.SIZE + 10, 0x000000, 0.75);
    bg.setStrokeStyle(2, 0xffffff);
    this.container.add(bg);

    // Terrain fill
    const terrain = this.scene.add.rectangle(0, 0, this.SIZE, this.SIZE, 0x3a6830, 0.6);
    this.container.add(terrain);

    // Viewport indicator
    this.viewport = this.scene.add.rectangle(0, 0, 10, 10, 0xffffff, 0.25);
    this.viewport.setStrokeStyle(2, 0xffff00);
    this.container.add(this.viewport);

    // Label
    const label = this.scene.add.text(0, -this.SIZE / 2 - 14, 'Map', {
      fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5, 1);
    this.container.add(label);

    // Click to navigate
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (!this.container) return;
      const lx = ptr.x - this.container.x;
      const ly = ptr.y - this.container.y;
      const wx = (lx + this.SIZE / 2) / this.scaleX;
      const wy = (ly + this.SIZE / 2) / this.scaleY;
      this.scene.cameras.main.centerOn(
        Phaser.Math.Clamp(wx, 0, this.worldW),
        Phaser.Math.Clamp(wy, 0, this.worldH),
      );
    });
  }

  public update(trees: Tree[], camera: Phaser.Cameras.Scene2D.Camera): void {
    if (!this.container) return;

    // Remove old dots
    this.treeDots.forEach(d => d.destroy());
    this.treeDots = [];

    // Draw tree dots
    trees.forEach(tree => {
      const wp = tree.getWorldPosition();
      const mx = wp.x * this.scaleX - this.SIZE / 2;
      const my = wp.y * this.scaleY - this.SIZE / 2;
      if (mx < -this.SIZE / 2 || mx > this.SIZE / 2) return;
      if (my < -this.SIZE / 2 || my > this.SIZE / 2) return;
      const dot = this.scene.add.circle(mx, my, 2, 0x228b22);
      dot.setScrollFactor(0);
      this.container!.add(dot);
      this.treeDots.push(dot);
    });

    // Update viewport rectangle
    if (this.viewport) {
      const vw = camera.width  * this.scaleX;
      const vh = camera.height * this.scaleY;
      const vx = camera.scrollX * this.scaleX - this.SIZE / 2;
      const vy = camera.scrollY * this.scaleY - this.SIZE / 2;
      this.viewport.setSize(vw, vh).setPosition(vx + vw / 2, vy + vh / 2);
    }
  }

  public setDepth(depth: number): void {
    this.container?.setDepth(depth);
  }

  public setVisible(v: boolean): void {
    this.container?.setVisible(v);
  }
}
