import Phaser from 'phaser';
import { TreeTypeConfig } from '../types/TreeTypes';

/**
 * Renders a 2-D "looking like 3-D" isometric tree.
 * Each species has its own distinct silhouette.
 */
export class IsometricTree {

  static createTreeGraphics(
    scene: Phaser.Scene,
    size: number,
    cfg: TreeTypeConfig,
  ): Phaser.GameObjects.Graphics {
    switch (cfg.shape) {
      case 'cone':  return IsometricTree.drawPine(scene, size, cfg);
      case 'palm':  return IsometricTree.drawPalm(scene, size, cfg);
      case 'small': return IsometricTree.drawBirch(scene, size, cfg);
      default:      return IsometricTree.drawRound(scene, size, cfg);
    }
  }

  // ── Round canopy (Oak / Cherry) ────────────────────────────────────────

  private static drawRound(
    scene: Phaser.Scene,
    size: number,
    cfg: TreeTypeConfig,
  ): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    const tw = Math.max(5, size * 0.12);
    const th = size * 0.50;
    const fw = size * 0.95;
    const fh = fw * 0.50;

    // Ground shadow
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(tw * 0.3, -2, fw * 0.65, fh * 0.40);

    // Trunk – front face
    g.fillStyle(cfg.trunkColor, 1);
    g.fillRect(-tw / 2, -th, tw, th);
    // Trunk – right side face
    const sideC = Math.max(0, cfg.trunkColor - 0x303030);
    g.fillStyle(sideC, 1);
    g.fillRect(tw / 2, -th + 2, tw * 0.28, th - 2);

    // Foliage
    const fcx = 0, fcy = -th - fh * 0.45;
    // Shadow / underside
    g.fillStyle(cfg.darkColor, 1);
    g.fillEllipse(fcx + fw * 0.07, fcy + fh * 0.14, fw * 0.88, fh * 0.88);
    // Main body
    g.fillStyle(cfg.foliageColor, 1);
    g.fillEllipse(fcx, fcy, fw, fh);
    // Highlight
    const hl = Math.min(0xffffff, cfg.foliageColor + 0x505050);
    g.fillStyle(hl, 0.65);
    g.fillEllipse(fcx - fw * 0.17, fcy - fh * 0.18, fw * 0.40, fh * 0.40);

    return g;
  }

  // ── Conical tiers (Pine) ───────────────────────────────────────────────

  private static drawPine(
    scene: Phaser.Scene,
    size: number,
    cfg: TreeTypeConfig,
  ): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    const tw = Math.max(4, size * 0.08);
    const th = size * 0.25;  // short trunk visible below lowest tier

    // Ground shadow
    g.fillStyle(0x000000, 0.16);
    g.fillEllipse(tw * 0.3, -2, size * 0.55, size * 0.18);

    // Trunk
    g.fillStyle(cfg.trunkColor, 1);
    g.fillRect(-tw / 2, -th, tw, th);

    // Three stacked conical tiers (bottom → top, each narrower and higher)
    const tiers = [
      { w: size * 0.85, h: size * 0.50, base: -th },
      { w: size * 0.62, h: size * 0.45, base: -th - size * 0.35 },
      { w: size * 0.38, h: size * 0.40, base: -th - size * 0.65 },
    ];

    for (const tier of tiers) {
      const cx = 0, cy = tier.base - tier.h * 0.5;
      // Shadow side (right)
      g.fillStyle(cfg.darkColor, 1);
      g.fillTriangle(
        cx,              tier.base,
        cx + tier.w / 2, tier.base,
        cx,              tier.base - tier.h,
      );
      // Lit side (left)
      g.fillStyle(cfg.foliageColor, 1);
      g.fillTriangle(
        cx,              tier.base,
        cx - tier.w / 2, tier.base,
        cx,              tier.base - tier.h,
      );
      // Top highlight
      const hl = Math.min(0xffffff, cfg.foliageColor + 0x404040);
      g.fillStyle(hl, 0.50);
      g.fillEllipse(cx - tier.w * 0.1, cy - tier.h * 0.25,
                    tier.w * 0.30, tier.h * 0.18);
    }

    return g;
  }

  // ── Palm ───────────────────────────────────────────────────────────────

  private static drawPalm(
    scene: Phaser.Scene,
    size: number,
    cfg: TreeTypeConfig,
  ): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    const tw = Math.max(4, size * 0.09);
    const th = size * 0.85;   // tall trunk

    // Ground shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(tw * 0.5, -2, size * 0.45, size * 0.14);

    // Trunk – slight lean (characteristic palm curve via two rects)
    g.fillStyle(cfg.trunkColor, 1);
    // Bottom half of trunk
    g.fillRect(-tw / 2, -th * 0.5, tw, th * 0.5);
    // Top half – shifted slightly right to mimic lean
    g.fillRect(-tw / 2 + size * 0.04, -th, tw, th * 0.52);

    // Trunk rings (texture)
    const ringC = Math.max(0, cfg.trunkColor - 0x202020);
    g.lineStyle(1, ringC, 0.6);
    for (let i = 1; i <= 5; i++) {
      const ry = -th * (i / 6);
      g.beginPath();
      g.moveTo(-tw / 2, ry);
      g.lineTo(tw / 2,  ry);
      g.strokePath();
    }

    // Fronds – 6 curved strokes radiating from crown
    const crownX = size * 0.04, crownY = -th;
    const frondLen = size * 0.65;
    const angles = [-60, -20, 20, 60, 100, -100]; // degrees
    for (const deg of angles) {
      const rad = Phaser.Math.DegToRad(deg - 90);
      const ex  = crownX + Math.cos(rad) * frondLen;
      const ey  = crownY + Math.sin(rad) * frondLen;
      const mx  = crownX + Math.cos(rad) * frondLen * 0.5 + Math.cos(rad + 0.8) * size * 0.12;
      const my  = crownY + Math.sin(rad) * frondLen * 0.5 + Math.sin(rad + 0.8) * size * 0.12;

      g.lineStyle(Math.max(2, size * 0.06), cfg.foliageColor, 1);
      g.beginPath();
      g.moveTo(crownX, crownY);
      // Quadratic curve approximated via two line segments
      g.lineTo(mx, my);
      g.lineTo(ex, ey);
      g.strokePath();

      // Darker edge on each frond
      g.lineStyle(1, cfg.darkColor, 0.5);
      g.beginPath();
      g.moveTo(crownX, crownY);
      g.lineTo(ex, ey);
      g.strokePath();
    }

    return g;
  }

  // ── Birch – slender with small canopy ─────────────────────────────────

  private static drawBirch(
    scene: Phaser.Scene,
    size: number,
    cfg: TreeTypeConfig,
  ): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    const tw = Math.max(3, size * 0.07); // very thin trunk
    const th = size * 0.65;
    const fw = size * 0.60;
    const fh = fw * 0.50;

    // Ground shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(tw * 0.3, -2, fw * 0.55, fh * 0.35);

    // Trunk (white/silver)
    g.fillStyle(cfg.trunkColor, 1);
    g.fillRect(-tw / 2, -th, tw, th);
    // Bark marks (dark horizontal lines)
    g.lineStyle(1, 0x888880, 0.7);
    for (let i = 1; i <= 4; i++) {
      const by = -th * (i / 5);
      g.beginPath();
      g.moveTo(-tw / 2, by);
      g.lineTo( tw / 2, by);
      g.strokePath();
    }

    // Foliage – airy, slightly offset
    const fcx = size * 0.06, fcy = -th - fh * 0.40;
    g.fillStyle(cfg.darkColor, 1);
    g.fillEllipse(fcx + fw * 0.08, fcy + fh * 0.14, fw * 0.85, fh * 0.85);
    g.fillStyle(cfg.foliageColor, 1);
    g.fillEllipse(fcx, fcy, fw, fh);
    // Small secondary cluster
    g.fillStyle(cfg.foliageColor, 0.85);
    g.fillEllipse(fcx + fw * 0.30, fcy + fh * 0.20, fw * 0.50, fh * 0.50);
    // Highlight
    const hl = Math.min(0xffffff, cfg.foliageColor + 0x606060);
    g.fillStyle(hl, 0.60);
    g.fillEllipse(fcx - fw * 0.15, fcy - fh * 0.15, fw * 0.35, fh * 0.35);

    return g;
  }
}
