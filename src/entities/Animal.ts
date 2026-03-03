import Phaser from 'phaser';
import { IsometricUtils, GRID_COLS, GRID_ROWS, TILE_W, TILE_H } from '../utils/IsometricUtils';

// ── Types ──────────────────────────────────────────────────────────────────

export type AnimalSpecies = 'mouse' | 'ant' | 'bug';

type State = 'idle' | 'wander' | 'dash';

// World bounds (computed from grid constants)
const WORLD_W = (GRID_COLS + GRID_ROWS) * (TILE_W / 2);
const WORLD_H = (GRID_COLS + GRID_ROWS) * (TILE_H / 2);

// Speed in world-pixels / second
const SPEEDS: Record<AnimalSpecies, { wander: number; dash: number }> = {
  mouse: { wander: 45,  dash: 180 },
  ant:   { wander: 60,  dash: 220 },
  bug:   { wander: 20,  dash:  80 },
};

// ── Animal ─────────────────────────────────────────────────────────────────

export class Animal extends Phaser.GameObjects.Container {
  readonly species: AnimalSpecies;

  private aiState: State = 'idle';
  private stateTimer  = 0;
  private targetX     = 0;
  private targetY     = 0;
  private speed       = 0;
  private hasTarget   = false;
  private gfx: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, species: AnimalSpecies) {
    super(scene, x, y);
    this.species = species;

    this.gfx = scene.add.graphics();
    this.drawSelf();
    this.add(this.gfx);

    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject);
    this.refreshDepth();
    this.enterIdle();
  }

  // ── Drawing ──────────────────────────────────────────────────────────────

  private drawSelf(): void {
    this.gfx.clear();
    switch (this.species) {
      case 'mouse': this.drawMouse(); break;
      case 'ant':   this.drawAnt();   break;
      case 'bug':   this.drawBug();   break;
    }
  }

  private drawMouse(): void {
    const g = this.gfx;
    // Shadow
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(0, 5, 20, 6);
    // Body
    g.fillStyle(0x9a8a7a, 1);
    g.fillEllipse(-2, 0, 16, 10);
    // Head
    g.fillStyle(0xb09a88, 1);
    g.fillCircle(8, -1, 6);
    // Ears
    g.fillStyle(0xcc8877, 1);
    g.fillCircle(10, -6, 3);
    g.fillCircle(7,  -7, 2.5);
    g.fillStyle(0xffbbaa, 0.8);
    g.fillCircle(10, -6, 1.5);
    // Eye
    g.fillStyle(0x111111, 1);
    g.fillCircle(11, -1, 1.2);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(11.5, -1.5, 0.5);
    // Nose
    g.fillStyle(0xff8899, 1);
    g.fillCircle(14, -1, 1);
    // Tail (curved line)
    g.lineStyle(1.5, 0x7a6a5a, 1);
    g.beginPath();
    g.moveTo(-9, 2);
    g.lineTo(-14, 6);
    g.lineTo(-16, 3);
    g.strokePath();
    // Feet (tiny)
    g.fillStyle(0x7a6a5a, 1);
    g.fillEllipse(-5, 6, 5, 3);
    g.fillEllipse(2,  6, 5, 3);
  }

  private drawAnt(): void {
    const g = this.gfx;
    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(0, 5, 16, 4);
    // Abdomen
    g.fillStyle(0x111111, 1);
    g.fillEllipse(-5, 0, 9, 6);
    // Petiole (waist)
    g.fillStyle(0x222222, 1);
    g.fillCircle(0, 0, 2);
    // Thorax
    g.fillEllipse(4, 0, 7, 5);
    // Head
    g.fillCircle(8, 0, 4);
    // Eyes (compound, tiny)
    g.fillStyle(0x444444, 1);
    g.fillCircle(9.5, -1, 1);
    g.fillCircle(9.5,  1, 1);
    // Antennae
    g.lineStyle(0.8, 0x333333, 1);
    g.beginPath(); g.moveTo(10, -2); g.lineTo(14, -5); g.strokePath();
    g.beginPath(); g.moveTo(10, -1); g.lineTo(15, -2); g.strokePath();
    // Legs (3 per side) — short lines from thorax
    g.lineStyle(0.8, 0x222222, 1);
    [-1, 2, 5].forEach(lx => {
      g.beginPath(); g.moveTo(lx, 2); g.lineTo(lx - 3, 6); g.strokePath();
      g.beginPath(); g.moveTo(lx, -2); g.lineTo(lx - 3, -6); g.strokePath();
    });
  }

  private drawBug(): void {
    const g = this.gfx;
    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(0, 6, 16, 5);
    // Wing cases (elytra) — two halves
    g.fillStyle(0x2d6e1a, 1);
    g.fillEllipse(-2, 0, 14, 9);
    // Wing split line
    g.lineStyle(0.8, 0x1a4510, 1);
    g.beginPath(); g.moveTo(-1, -4); g.lineTo(-1, 4); g.strokePath();
    // Spots
    g.fillStyle(0x1a4510, 0.5);
    g.fillCircle(-4, -1, 1.5);
    g.fillCircle(-4,  1, 1.5);
    // Pronotum (shield behind head)
    g.fillStyle(0x1e5214, 1);
    g.fillEllipse(5, 0, 6, 7);
    // Head
    g.fillStyle(0x111111, 1);
    g.fillCircle(8, 0, 3);
    // Eyes
    g.fillStyle(0x885500, 1);
    g.fillCircle(9, -1.5, 1.2);
    g.fillCircle(9,  1.5, 1.2);
    // Antennae
    g.lineStyle(0.8, 0x111111, 1);
    g.beginPath(); g.moveTo(9, -2); g.lineTo(13, -5); g.strokePath();
    g.beginPath(); g.moveTo(9,  2); g.lineTo(13,  5); g.strokePath();
    // Legs (short, tucked)
    g.lineStyle(0.8, 0x111111, 1);
    [-3, 0, 3].forEach(lx => {
      g.beginPath(); g.moveTo(lx, 4); g.lineTo(lx + 1, 8); g.strokePath();
      g.beginPath(); g.moveTo(lx, -4); g.lineTo(lx + 1, -8); g.strokePath();
    });
  }

  // ── Update ───────────────────────────────────────────────────────────────

  update(delta: number, treeWorldPositions: { x: number; y: number }[]): void {
    const dt = delta / 1000;
    this.stateTimer -= dt;

    if (this.aiState === 'idle') {
      if (this.stateTimer <= 0) {
        // Occasionally dash to a nearby tree to "hide"
        if (treeWorldPositions.length > 0 && Math.random() < 0.25) {
          this.enterDash(treeWorldPositions);
        } else {
          this.enterWander();
        }
      }
      return;
    }

    if (!this.hasTarget) { this.enterIdle(); return; }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.enterIdle();
      return;
    }

    const step = Math.min(this.speed * dt, dist);
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;

    // Flip sprite based on horizontal direction
    this.scaleX = dx < 0 ? -1 : 1;

    // Tiny vertical bob when wandering (not dashing — looks odd fast)
    if (this.aiState === 'wander') {
      this.gfx.y = Math.sin(Date.now() * 0.006) * 1.2;
    }

    this.refreshDepth();
  }

  // ── State machine ────────────────────────────────────────────────────────

  private enterIdle(): void {
    this.aiState   = 'idle';
    this.hasTarget = false;
    this.stateTimer = 0.8 + Math.random() * 3.5;
    this.gfx.y = 0;
  }

  private enterWander(): void {
    this.aiState = 'wander';
    this.speed  = SPEEDS[this.species].wander;
    const range = 160;
    this.targetX = Phaser.Math.Clamp(this.x + (Math.random() - 0.5) * range * 2, 0, WORLD_W);
    this.targetY = Phaser.Math.Clamp(this.y + (Math.random() - 0.5) * range,     0, WORLD_H);
    this.hasTarget  = true;
    this.stateTimer = 12;
  }

  private enterDash(treePositions: { x: number; y: number }[]): void {
    this.aiState = 'dash';
    this.speed  = SPEEDS[this.species].dash;

    // Pick a nearby tree to hide behind (prefer within 350 px)
    const candidates = treePositions
      .map(t => ({ ...t, d: Math.hypot(t.x - this.x, t.y - this.y) }))
      .filter(t => t.d < 400 && t.d > 15)
      .sort((a, b) => a.d - b.d)
      .slice(0, 5);

    const pick = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : treePositions[Math.floor(Math.random() * treePositions.length)];

    if (!pick) { this.enterWander(); return; }

    this.targetX   = pick.x + (Math.random() - 0.5) * 10;
    this.targetY   = pick.y + (Math.random() - 0.5) * 6;
    this.hasTarget = true;
    this.stateTimer = 8;
  }

  // ── Depth ────────────────────────────────────────────────────────────────

  private refreshDepth(): void {
    // Use continuous worldY-based depth to interleave with tree depths.
    // getDepth takes fractional grid coords — worldToGrid gives those.
    const g = IsometricUtils.worldToGrid(this.x, this.y);
    this.setDepth(IsometricUtils.getDepth(g.x, g.y));
  }
}
