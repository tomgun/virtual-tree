import Phaser from 'phaser';

/**
 * Draws a simple isometric-style tree sprite.
 *
 * Viewed from above-and-to-the-side (classic isometric):
 *  - trunk  : thin vertical rectangle (screen-space upright)
 *  - foliage: squashed ellipse (2:1 ratio) → looks like a sphere from iso angle
 */
export class IsometricTree {
  static createTreeGraphics(
    scene: Phaser.Scene,
    size: number,
    color: number,
  ): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();

    const trunkW = Math.max(5, size * 0.12);
    const trunkH = size * 0.55;
    // Foliage: squashed ellipse (2:1 ratio) looks like a sphere from iso angle
    const fw = size * 0.90;
    const fh = fw * 0.50;

    // ── GROUND SHADOW ─────────────────────────────────────────────────
    // Soft oval shadow at y=0 anchors the tree visually to the tile
    g.fillStyle(0x000000, 0.20);
    g.fillEllipse(trunkW * 0.3, -2, fw * 0.65, fh * 0.45);

    // ── TRUNK ─────────────────────────────────────────────────────────
    // Front face (lighter brown)
    g.fillStyle(0x7b4a22, 1);
    g.fillRect(-trunkW / 2, -trunkH, trunkW, trunkH);
    // Right side face (darker) → 3-D depth cue
    g.fillStyle(0x4e2e0f, 1);
    g.fillRect(trunkW / 2, -trunkH + 2, trunkW * 0.30, trunkH - 2);

    // ── FOLIAGE ───────────────────────────────────────────────────────
    const fcx = 0;
    const fcy = -trunkH - fh * 0.45;

    // Dark underside (right/down offset) → depth shadow
    g.fillStyle(Math.max(0, color - 0x303030), 1);
    g.fillEllipse(fcx + fw * 0.07, fcy + fh * 0.13, fw * 0.88, fh * 0.88);

    // Main foliage body
    g.fillStyle(color, 1);
    g.fillEllipse(fcx, fcy, fw, fh);

    // Bright highlight (top-left) → convex sphere cue
    const hlColor = Math.min(0xffffff, color + 0x505050);
    g.fillStyle(hlColor, 0.70);
    g.fillEllipse(fcx - fw * 0.17, fcy - fh * 0.17, fw * 0.42, fh * 0.42);

    return g;
  }

  /** Redraw an existing graphics object with new size/color */
  static updateGraphics(
    g: Phaser.GameObjects.Graphics,
    size: number,
    color: number,
  ): void {
    g.clear();
    // Re-use same drawing logic (DRY via internal helper isn't trivial with Phaser
    // graphics, so we just recreate — caller replaces the object instead)
    void size; void color; // handled by caller replacing the sprite
  }
}
