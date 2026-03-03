import Phaser from 'phaser';
import { Tree, TreeData } from '../entities/Tree';
import { CO2Calculator } from '../systems/CO2Calculator';
import { StorageManager, GameState } from '../systems/StorageManager';
import { GrowthConfig } from '../systems/GrowthConfig';
import { Minimap } from '../systems/Minimap';
import {
  IsometricUtils,
  TILE_W, TILE_H,
  GRID_COLS, GRID_ROWS,
} from '../utils/IsometricUtils';

export class MainScene extends Phaser.Scene {
  // ── State ──────────────────────────────────────────────────────────
  private trees: Tree[] = [];
  private playerName = '';
  private growthMultiplier: number;

  // ── Systems ────────────────────────────────────────────────────────
  private co2Calculator = new CO2Calculator();
  private minimap?: Minimap;

  // ── UI references ─────────────────────────────────────────────────
  private scoreText?: Phaser.GameObjects.Text;
  private playerNameText?: Phaser.GameObjects.Text;
  private nameInput?: Phaser.GameObjects.DOMElement;
  private nameInputActive = false;

  // ── Camera ────────────────────────────────────────────────────────
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly CAM_SPEED = 6;

  // World (screen-space) dimensions of the full isometric grid
  private readonly WORLD_W = (GRID_COLS + GRID_ROWS) * (TILE_W / 2) + TILE_W;
  private readonly WORLD_H = (GRID_COLS + GRID_ROWS) * (TILE_H / 2) + TILE_H;
  private readonly MINIMAP_SIZE = 200;

  constructor() {
    super({ key: 'MainScene' });
    this.growthMultiplier = GrowthConfig.getTimeMultiplier();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────

  create(): void {
    this.input.enabled = true;
    if (this.input.keyboard) this.input.keyboard.enabled = true;

    this.loadGameState();
    this.createTerrain();
    this.setupCamera();
    this.setupInput();
    this.createUI();

    if (!this.playerName) {
      this.time.delayedCall(400, () => this.showNameInput());
    }

    this.time.addEvent({ delay: 1000, callback: this.tickTreeGrowth, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 500,  callback: this.tickMinimap,    callbackScope: this, loop: true });
  }

  // ── Terrain ────────────────────────────────────────────────────────

  private createTerrain(): void {
    const terrain = this.add.graphics();
    terrain.setDepth(0);

    // ── Step 1: Flood-fill the entire world with grass ─────────────────
    // Adjacent filled WebGL polygons leave sub-pixel tears even when they share
    // an exact edge. Fix: paint one big solid rectangle first, then draw only
    // the tile OUTLINES on top. The solid rect is the "colour", the outlines
    // give the grid — and a rectangle can never have cracks.
    terrain.fillStyle(0x4a8038, 1);
    terrain.fillRect(0, -TILE_H * 2, this.WORLD_W + TILE_W, this.WORLD_H + TILE_H * 4);

    // ── Step 2: Draw tile outlines only (no polygon fill needed) ───────
    const hw = TILE_W / 2;
    const hh = TILE_H / 2;
    terrain.lineStyle(1, 0x2d5c1a, 0.55);

    for (let gx = 0; gx <= GRID_COLS; gx++) {
      for (let gy = 0; gy <= GRID_ROWS; gy++) {
        const p = IsometricUtils.gridToWorld(gx, gy);
        terrain.beginPath();
        terrain.moveTo(p.x,      p.y - hh);
        terrain.lineTo(p.x + hw, p.y);
        terrain.lineTo(p.x,      p.y + hh);
        terrain.lineTo(p.x - hw, p.y);
        terrain.closePath();
        terrain.strokePath();
      }
    }
  }

  // ── Camera ─────────────────────────────────────────────────────────

  private setupCamera(): void {
    this.cameras.main.setBounds(0, -TILE_H, this.WORLD_W, this.WORLD_H + TILE_H * 2);
    // Start centred on the middle of the grid
    const mid = IsometricUtils.gridToWorld(GRID_COLS / 2, GRID_ROWS / 2);
    this.cameras.main.centerOn(mid.x, mid.y);
  }

  // ── Input ──────────────────────────────────────────────────────────

  private setupInput(): void {
    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();

    // Space → name dialog
    this.input.keyboard
      .addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      .on('down', () => { if (!this.nameInputActive) this.showNameInput(); });

    // Click → plant tree
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this.nameInputActive) {
        const el = document.elementFromPoint(ptr.x, ptr.y);
        const ids = ['player-name-input', 'save-name-btn', 'skip-name-btn'];
        if (ids.some(id => document.getElementById(id)?.contains(el as Node))) return;
        // clicked outside dialog → dismiss
        this.savePlayerName(this.playerName || 'Player');
      }
      if (!this.playerName) { this.showNameInput(); return; }

      // ptr.worldX / ptr.worldY already account for camera scroll
      const grid    = IsometricUtils.worldToGrid(ptr.worldX, ptr.worldY);
      const snapped = IsometricUtils.snapToGrid(grid.x, grid.y);
      const gx = Phaser.Math.Clamp(snapped.x, 0, GRID_COLS - 1);
      const gy = Phaser.Math.Clamp(snapped.y, 0, GRID_ROWS - 1);

      this.placeTree(gx, gy);
    });
  }

  // ── UI ─────────────────────────────────────────────────────────────

  private createUI(): void {
    // CO₂ score
    this.scoreText = this.add.text(20, 20, '', {
      fontSize: '26px', color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 12, y: 8 }, fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(2000);
    this.updateScoreDisplay();

    // Player name
    this.playerNameText = this.add.text(20, 72, `Player: ${this.playerName || '–'}`, {
      fontSize: '18px', color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(2000);

    // Instructions
    const modeLabel = GrowthConfig.isTestMode()
      ? `TEST: ${GrowthConfig.getGrowthDescription()}`
      : `PROD: ${GrowthConfig.getGrowthDescription()}`;
    const instrText = this.add.text(
      this.cameras.main.width - 20, 20,
      `Click → plant tree\nArrows → move camera\nSpace → change name\n(${modeLabel})`,
      { fontSize: '14px', color: '#ffffff', backgroundColor: '#000000cc',
        padding: { x: 8, y: 6 }, align: 'right' },
    ).setOrigin(1, 0).setScrollFactor(0).setDepth(2000);

    // Minimap – below instructions, never overlapping
    this.minimap = new Minimap(this, this.WORLD_W, this.WORLD_H);
    this.minimap.create(
      this.cameras.main.width  - this.MINIMAP_SIZE / 2 - 20,
      20 + instrText.height    + this.MINIMAP_SIZE / 2 + 16,
    );
    this.minimap.setDepth(1000);
  }

  private showNameInput(): void {
    if (this.nameInputActive) return;
    this.nameInputActive = true;

    const html = `
      <div style="background:rgba(0,0,0,.9);padding:20px;border-radius:10px;
                  text-align:center;border:2px solid #3a6830;">
        <p style="color:#fff;font-size:17px;margin-bottom:10px;">Enter your name:</p>
        <input id="player-name-input" type="text"
          style="padding:9px;font-size:15px;width:190px;border-radius:5px;border:1px solid #ccc;"
          value="${this.playerName}" placeholder="Player Name" />
        <br><br>
        <button id="save-name-btn"
          style="padding:9px 18px;font-size:15px;background:#3a6830;color:#fff;
                 border:none;border-radius:5px;cursor:pointer;margin-right:8px;">Save</button>
        <button id="skip-name-btn"
          style="padding:9px 18px;font-size:15px;background:#555;color:#fff;
                 border:none;border-radius:5px;cursor:pointer;">Skip</button>
      </div>`;

    this.nameInput = this.add.dom(
      this.cameras.main.width / 2, this.cameras.main.height / 2,
      'div', null, html,
    ).setScrollFactor(0).setDepth(3000);

    const inp  = document.getElementById('player-name-input') as HTMLInputElement;
    const save = document.getElementById('save-name-btn') as HTMLButtonElement;
    const skip = document.getElementById('skip-name-btn') as HTMLButtonElement;

    inp?.focus();
    inp?.addEventListener('keydown', e => {
      if (e.key === 'Enter')  this.savePlayerName(inp.value);
      if (e.key === 'Escape') this.savePlayerName(this.playerName || 'Player');
    });
    save?.addEventListener('click', () => this.savePlayerName(inp?.value ?? ''));
    skip?.addEventListener('click', () => this.savePlayerName(this.playerName || 'Player'));
  }

  private savePlayerName(name: string): void {
    this.playerName = name.trim() || 'Player';
    this.playerNameText?.setText(`Player: ${this.playerName}`);
    this.saveGameState();
    this.nameInput?.destroy();
    this.nameInput = undefined;
    this.nameInputActive = false;
  }

  // ── Tree placement ─────────────────────────────────────────────────

  private placeTree(gx: number, gy: number): void {
    if (!this.playerName) { this.showNameInput(); return; }

    const data: TreeData = {
      id: `tree-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      x: gx, y: gy, age: 0,
      species: 'oak',
      playerName: this.playerName,
      plantedAt: Date.now(),
    };
    const tree = new Tree(this, data);
    this.trees.push(tree);
    this.saveGameState();
    this.updateScoreDisplay();
  }

  // ── Periodic callbacks ─────────────────────────────────────────────

  private tickTreeGrowth(): void {
    const now = Date.now();
    this.trees.forEach(t => t.updateAge(now, this.growthMultiplier));
    this.updateScoreDisplay();
    this.saveGameState();
  }

  private tickMinimap(): void {
    this.minimap?.update(this.trees, this.cameras.main);
  }

  private updateScoreDisplay(): void {
    if (!this.scoreText) return;
    const total     = this.co2Calculator.calculateTotal(this.trees.map(t => t.treeData));
    const formatted = this.co2Calculator.formatScore(total);
    this.scoreText.setText(`CO₂ Score: ${formatted}`);
  }

  // ── Persistence ────────────────────────────────────────────────────

  private loadGameState(): void {
    if (!StorageManager.isAvailable()) return;
    const state = StorageManager.load();
    if (!state) return;

    this.playerName = state.playerName ?? '';

    state.trees.forEach(data => {
      // Guard: skip trees with out-of-grid coordinates (stale format)
      if (data.x < 0 || data.x >= GRID_COLS || data.y < 0 || data.y >= GRID_ROWS) return;
      const tree = new Tree(this, data);
      this.trees.push(tree);
    });
  }

  private saveGameState(): void {
    if (!StorageManager.isAvailable()) return;
    const state: GameState = {
      playerName: this.playerName,
      trees: this.trees.map(t => t.treeData),
      lastUpdated: Date.now(),
    };
    StorageManager.save(state);
  }

  // ── Game loop ──────────────────────────────────────────────────────

  update(): void {
    if (this.nameInputActive || !this.cursors) return;
    const cam = this.cameras.main;
    if (this.cursors.left.isDown)  cam.scrollX -= this.CAM_SPEED;
    if (this.cursors.right.isDown) cam.scrollX += this.CAM_SPEED;
    if (this.cursors.up.isDown)    cam.scrollY -= this.CAM_SPEED;
    if (this.cursors.down.isDown)  cam.scrollY += this.CAM_SPEED;
  }
}
