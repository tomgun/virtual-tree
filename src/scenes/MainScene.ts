import Phaser from 'phaser';
import { Tree, TreeData } from '../entities/Tree';
import { CO2Calculator } from '../systems/CO2Calculator';
import { StorageManager, GameState } from '../systems/StorageManager';
import { GrowthConfig } from '../systems/GrowthConfig';
import { Minimap } from '../systems/Minimap';
import { AnimalManager } from '../systems/AnimalManager';
import {
  IsometricUtils,
  TILE_W, TILE_H,
  GRID_COLS, GRID_ROWS,
} from '../utils/IsometricUtils';
import { TREE_TYPES, TreeSpecies } from '../types/TreeTypes';

export class MainScene extends Phaser.Scene {
  // ── State ──────────────────────────────────────────────────────────
  private trees: Tree[] = [];
  private playerName = '';
  private growthMultiplier: number;

  // ── Systems ────────────────────────────────────────────────────────
  private co2Calculator = new CO2Calculator();
  private minimap?: Minimap;
  private animalManager?: AnimalManager;

  // Stress data is stashed from localStorage before animalManager exists
  private savedStressEventCount    = 0;
  private savedStressWeightedScore = 0;

  // ── UI references ─────────────────────────────────────────────────
  private scoreText?: Phaser.GameObjects.Text;
  private playerNameText?: Phaser.GameObjects.Text;
  private newGameBtn?: Phaser.GameObjects.Text;
  private instrText?: Phaser.GameObjects.Text;
  private helpBtn?: Phaser.GameObjects.Text;
  private nameInput?: Phaser.GameObjects.DOMElement;
  private nameInputActive = false;
  private instrVisible = false;

  // ── CO₂ info panel ────────────────────────────────────────────────
  private infoPanel?: Phaser.GameObjects.Container;
  private infoPanelVisible = false;

  // ── Age labels ────────────────────────────────────────────────────
  private showAgeLabels = true;

  // ── Tree selection ────────────────────────────────────────────────
  private selectedSpecies: TreeSpecies = 'oak';
  private selectorButtons: Phaser.GameObjects.Container[] = [];
  private selectorRects: Array<{ x: number; y: number; w: number; h: number; species: TreeSpecies }> = [];
  private readonly BTN_W = 80;
  private readonly BTN_H = 54;

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

    // Ensure the canvas is focusable and has focus so keyboard events work
    // regardless of whether the name-input dialog is ever shown.
    const canvas = this.game.canvas;
    canvas.setAttribute('tabindex', '0');
    canvas.style.outline = 'none';
    canvas.focus();

    this.loadGameState();
    this.createTerrain();
    this.setupCamera();
    this.setupInput();
    this.createUI();
    this.createTreeSelector();

    this.animalManager = new AnimalManager(this);
    this.animalManager.sync(this.trees);
    this.animalManager.loadStressData(this.savedStressEventCount, this.savedStressWeightedScore);

    this.time.addEvent({ delay: 1000, callback: this.tickTreeGrowth, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 500,  callback: this.tickMinimap,    callbackScope: this, loop: true });

    // Reposition fixed UI when the canvas is resized
    this.scale.on('resize', this.repositionUI, this);
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
    const kb = this.input.keyboard;

    // Arrow keys polled each frame via cursors
    this.cursors = kb.createCursorKeys();

    // Use the keydown-KEY event pattern for one-shot actions.
    // This is more reliable than addKey().on('down') because createCursorKeys()
    // already owns the SPACE Key object and can interfere with separate addKey() calls.

    // Space → name dialog
    kb.on('keydown-SPACE', () => { if (!this.nameInputActive) this.showNameInput(); });

    // I → CO₂ impact info panel (toggle; allowed even when panel is open so I closes it)
    kb.on('keydown-I', () => { if (!this.nameInputActive) this.toggleInfoPanel(); });

    // A → toggle tree age labels
    kb.on('keydown-A', () => { if (!this.nameInputActive) this.toggleAgeLabels(); });

    // 1–5 → select tree species
    ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'].forEach((name, i) => {
      if (i < TREE_TYPES.length) {
        kb.on(`keydown-${name}`, () => {
          if (!this.nameInputActive) this.selectSpecies(TREE_TYPES[i].species);
        });
      }
    });

    // Explicitly capture keys we want to intercept so the browser doesn't
    // handle them first (e.g. Space scrolling the page).
    kb.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.I,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    ]);

    // Hover → tooltip for toolbar, pointer cursor for interactive UI
    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      const inMinimap    = this.isInMinimap(ptr.x, ptr.y);
      const inHelpBtn    = this.isInHelpBtn(ptr.x, ptr.y);
      const inPlayerName = this.isInPlayerName(ptr.x, ptr.y);
      const inNewGame    = this.isInNewGameBtn(ptr.x, ptr.y);
      const btnIdx       = this.toolbarBtnAt(ptr.x, ptr.y);

      this.game.canvas.style.cursor =
        (inMinimap || inHelpBtn || inPlayerName || inNewGame || btnIdx !== -1) ? 'pointer' : 'default';

      if (btnIdx !== -1) {
        const r = this.selectorRects[btnIdx];
        this.showTooltip(r.x + r.w / 2, r.y - 6, TREE_TYPES[btnIdx].description);
      } else {
        this.hideTooltip();
      }
    });

    // Click → help toggle / minimap navigate / toolbar select / plant tree
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this.nameInputActive) {
        const el = document.elementFromPoint(ptr.x, ptr.y);
        const ids = ['player-name-input', 'save-name-btn', 'skip-name-btn'];
        if (ids.some(id => document.getElementById(id)?.contains(el as Node))) return;
        this.savePlayerName(this.playerName || 'Player');
      }

      // Player name → open name editor
      if (this.isInPlayerName(ptr.x, ptr.y)) {
        this.showNameInput();
        return;
      }

      // New game button
      if (this.isInNewGameBtn(ptr.x, ptr.y)) {
        this.confirmNewGame();
        return;
      }

      // ? help button
      if (this.isInHelpBtn(ptr.x, ptr.y)) {
        this.toggleInstructions();
        return;
      }

      // Minimap click → pan camera (screen coords)
      if (this.isInMinimap(ptr.x, ptr.y)) {
        this.minimap?.navigateToScreenPoint(ptr.x, ptr.y);
        return;
      }

      // Toolbar buttons (screen coords)
      const btnIdx = this.toolbarBtnAt(ptr.x, ptr.y);
      if (btnIdx !== -1) {
        this.selectSpecies(this.selectorRects[btnIdx].species);
        return;
      }

      // Close info panel on any click outside it
      if (this.infoPanelVisible) { this.toggleInfoPanel(); return; }

      if (!this.playerName) { this.showNameInput(); return; }

      // Plant tree — ptr.worldX / ptr.worldY account for camera scroll
      const grid    = IsometricUtils.worldToGrid(ptr.worldX, ptr.worldY);
      const snapped = IsometricUtils.snapToGrid(grid.x, grid.y);
      const gx = Phaser.Math.Clamp(snapped.x, 0, GRID_COLS - 1);
      const gy = Phaser.Math.Clamp(snapped.y, 0, GRID_ROWS - 1);

      this.placeTree(gx, gy);
    });
  }

  /** Returns true when screen point (px,py) is inside the minimap panel. */
  private isInMinimap(px: number, py: number): boolean {
    if (!this.minimap) return false;
    const r = this.minimap.getScreenBounds();
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  /** Returns true when screen point (px,py) is inside the ? help button. */
  private isInHelpBtn(px: number, py: number): boolean {
    if (!this.helpBtn) return false;
    const b = this.helpBtn.getBounds();
    return px >= b.left && px <= b.right && py >= b.top && py <= b.bottom;
  }

  private isInPlayerName(px: number, py: number): boolean {
    if (!this.playerNameText) return false;
    const b = this.playerNameText.getBounds();
    return px >= b.left && px <= b.right && py >= b.top && py <= b.bottom;
  }

  private isInNewGameBtn(px: number, py: number): boolean {
    if (!this.newGameBtn) return false;
    const b = this.newGameBtn.getBounds();
    return px >= b.left && px <= b.right && py >= b.top && py <= b.bottom;
  }

  private confirmNewGame(): void {
    if (!window.confirm('Start a new game?\nAll your trees and progress will be lost.')) return;
    StorageManager.clear();
    this.scene.restart();
  }

  /** Returns toolbar button index (0-based) under screen point, or -1. */
  private toolbarBtnAt(px: number, py: number): number {
    return this.selectorRects.findIndex(r =>
      px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h,
    );
  }

  // ── UI ─────────────────────────────────────────────────────────────

  private createUI(): void {
    const W = this.cameras.main.width;

    // CO₂ score
    this.scoreText = this.add.text(20, 20, '', {
      fontSize: '26px', color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 12, y: 8 }, fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(2000);
    this.updateScoreDisplay();

    // Player name — clickable to edit
    this.playerNameText = this.add.text(20, 72, '', {
      fontSize: '16px', color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setDepth(2000);
    this.updatePlayerNameText();

    // New game button
    this.newGameBtn = this.add.text(20, 108, '↺  new game', {
      fontSize: '13px', color: '#ff9999',
      backgroundColor: '#220000bb',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(2000);

    // ? help button (top-right)
    this.helpBtn = this.add.text(W - 20, 20, ' ? ', {
      fontSize: '18px', color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 8, y: 6 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(2001);

    // Instructions panel (hidden by default, toggled by ? button)
    const modeLabel = GrowthConfig.isTestMode()
      ? `TEST: ${GrowthConfig.getGrowthDescription()}`
      : `PROD: ${GrowthConfig.getGrowthDescription()}`;
    this.instrText = this.add.text(
      W - 20, 20 + (this.helpBtn?.height ?? 36) + 6,
      `Click → plant tree\nArrows → move camera\nClick name → change name\n1-5 → select tree type\nA → toggle age labels\nI → CO₂ impact panel\n(${modeLabel})`,
      { fontSize: '14px', color: '#ffffff', backgroundColor: '#000000cc',
        padding: { x: 8, y: 6 }, align: 'right' },
    ).setOrigin(1, 0).setScrollFactor(0).setDepth(2000).setVisible(false);

    // Minimap – positioned below help button
    this.minimap = new Minimap(this, this.WORLD_W, this.WORLD_H);
    this.minimap.create(
      W - this.MINIMAP_SIZE / 2 - 20,
      20 + (this.helpBtn?.height ?? 36) + 6 + this.MINIMAP_SIZE / 2 + 16,
    );
    this.minimap.setDepth(1000);
  }

  private repositionUI(): void {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // Help button stays top-right
    this.helpBtn?.setX(W - 20);

    // Instructions panel just below the help button
    const helpH = this.helpBtn?.height ?? 36;
    this.instrText?.setPosition(W - 20, 20 + helpH + 6);

    // Minimap: below where instructions would be (always same offset from ? btn)
    const minimapCy = 20 + helpH + 6 + this.MINIMAP_SIZE / 2 + 16;
    this.minimap?.setPosition(W - this.MINIMAP_SIZE / 2 - 20, minimapCy);

    // Toolbar: recentre along bottom
    const { BTN_W, BTN_H } = this;
    const gap    = 8;
    const totalW = TREE_TYPES.length * (BTN_W + gap) - gap;
    const startX = (W - totalW) / 2;
    const barY   = H - BTN_H - 14;

    this.selectorRects = [];
    this.selectorButtons.forEach((container, i) => {
      const bx = startX + i * (BTN_W + gap);
      container.setPosition(bx + BTN_W / 2, barY + BTN_H / 2);
      this.selectorRects.push({ x: bx, y: barY, w: BTN_W, h: BTN_H, species: TREE_TYPES[i].species });
    });
  }

  private toggleInstructions(): void {
    this.instrVisible = !this.instrVisible;
    this.instrText?.setVisible(this.instrVisible);
    if (this.helpBtn) {
      this.helpBtn.setText(this.instrVisible ? ' ✕ ' : ' ? ');
    }
  }

  // ── Tree type selector toolbar ──────────────────────────────────────

  private createTreeSelector(): void {
    const { BTN_W, BTN_H } = this;
    const gap    = 8;
    const totalW = TREE_TYPES.length * (BTN_W + gap) - gap;
    const startX = (this.cameras.main.width - totalW) / 2;
    const barY   = this.cameras.main.height - BTN_H - 14;

    TREE_TYPES.forEach((cfg, i) => {
      const bx = startX + i * (BTN_W + gap);

      // Record screen-space rect for pointer hit-testing
      this.selectorRects.push({ x: bx, y: barY, w: BTN_W, h: BTN_H, species: cfg.species });

      const container = this.add.container(bx + BTN_W / 2, barY + BTN_H / 2);
      container.setScrollFactor(0).setDepth(2000);

      // [0] Background panel
      const bg = this.add.graphics();
      container.add(bg);

      // [1] Emoji + name label (show key shortcut)
      const label = this.add.text(0, -5, `${cfg.emoji} ${i + 1}\n${cfg.name}`, {
        fontSize: '12px', color: '#ffffff',
        align: 'center', lineSpacing: 2,
      }).setOrigin(0.5, 0.5);
      container.add(label);

      // [2] CO₂ rate hint
      const co2hint = this.add.text(0, BTN_H / 2 - 10, `${cfg.co2PerYear} kg/yr`, {
        fontSize: '9px', color: '#aaffaa',
        align: 'center',
      }).setOrigin(0.5, 0.5);
      container.add(co2hint);

      // [3] Selection border
      const border = this.add.graphics();
      container.add(border);

      this.selectorButtons.push(container);
    });

    this.refreshSelectorButtons();
  }

  private selectSpecies(species: TreeSpecies): void {
    this.selectedSpecies = species;
    this.refreshSelectorButtons();
  }

  private refreshSelectorButtons(): void {
    const { BTN_W, BTN_H } = this;
    this.selectorButtons.forEach((container, i) => {
      const bg     = container.getAt(0) as Phaser.GameObjects.Graphics;
      const border = container.getAt(3) as Phaser.GameObjects.Graphics;
      const selected = TREE_TYPES[i].species === this.selectedSpecies;

      bg.clear();
      border.clear();

      if (selected) {
        bg.fillStyle(0x1a4d10, 0.92);
        bg.fillRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 8);
        border.lineStyle(3, 0x88ff44, 1);
        border.strokeRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 8);
      } else {
        bg.fillStyle(0x000000, 0.72);
        bg.fillRoundedRect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H, 8);
      }
    });
  }

  private tooltip?: Phaser.GameObjects.Text;

  // ── CO₂ impact info panel ──────────────────────────────────────────

  private static readonly CO2_EQUIVALENCES = [
    { emoji: '✈️',  label: '500 km flights',               kgPerUnit: 100,   unit: 'flight'      },
    { emoji: '🥩',  label: 'kg of beef produced',          kgPerUnit: 27,    unit: 'kg beef'     },
    { emoji: '🚗',  label: 'km driven by car',             kgPerUnit: 0.12,  unit: 'km'          },
    { emoji: '💻',  label: 'data centre server-hours',     kgPerUnit: 0.5,   unit: 'server-hr'   },
    { emoji: '📱',  label: 'smartphone years of charging', kgPerUnit: 8,     unit: 'phone-year'  },
    { emoji: '🤖',  label: '100k-token AI prompts',        kgPerUnit: 0.05,  unit: 'prompt'      },
    { emoji: '📺',  label: 'hours of streaming video',     kgPerUnit: 0.036, unit: 'hr'          },
    { emoji: '👕',  label: 'new cotton t-shirts produced', kgPerUnit: 7,     unit: 't-shirt'     },
    { emoji: '🍺',  label: 'pints of beer brewed',         kgPerUnit: 0.3,   unit: 'pint'        },
    { emoji: '🏠',  label: 'days of home heating (EU avg)',kgPerUnit: 8.5,   unit: 'day'         },
    { emoji: '🛁',  label: 'hot baths taken',              kgPerUnit: 0.5,   unit: 'bath'        },
    { emoji: '🎮',  label: 'hours of PC gaming',           kgPerUnit: 0.1,   unit: 'hr'          },
  ];

  private toggleAgeLabels(): void {
    this.showAgeLabels = !this.showAgeLabels;
    this.trees.forEach(t => t.setAgeVisible(this.showAgeLabels));
  }

  private toggleInfoPanel(): void {
    this.infoPanelVisible = !this.infoPanelVisible;
    this.infoPanel?.destroy();
    this.infoPanel = undefined;
    if (this.infoPanelVisible) {
      this.buildInfoPanel();
    } else {
      this.game.canvas.focus();
    }
  }

  private buildInfoPanel(): void {
    const totalKg = this.co2Calculator.calculateTotal(this.trees.map(t => t.treeData));

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const PW = Math.min(W - 40, 560);
    const PH = Math.min(H - 40, 600);
    const cx = W / 2;
    const cy = H / 2;

    this.infoPanel = this.add.container(cx, cy).setScrollFactor(0).setDepth(4000);

    // Dim overlay behind panel
    const overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setScrollFactor(0);
    this.infoPanel.add(overlay);

    // Panel background
    const bg = this.add.graphics();
    bg.fillStyle(0x0d2b0d, 0.97);
    bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 14);
    bg.lineStyle(2, 0x44aa44, 0.9);
    bg.strokeRoundedRect(-PW / 2, -PH / 2, PW, PH, 14);
    this.infoPanel.add(bg);

    // Title
    const title = this.add.text(0, -PH / 2 + 24, '🌍  CO₂ Impact — Your Trees vs the World', {
      fontSize: '17px', color: '#88ff88', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5, 0);
    this.infoPanel.add(title);

    // Score headline
    const scoreLabel = this.co2Calculator.formatScore(totalKg);
    const headline = this.add.text(0, -PH / 2 + 58,
      `Your forest has absorbed  ${scoreLabel}  of CO₂`, {
      fontSize: '15px', color: '#ffffff', align: 'center',
      backgroundColor: '#1a4d1a', padding: { x: 12, y: 6 },
    }).setOrigin(0.5, 0);
    this.infoPanel.add(headline);

    // Subheading
    const sub = this.add.text(0, -PH / 2 + 102,
      totalKg < 0.01
        ? 'Plant more trees to see your impact here!'
        : 'That is equivalent to offsetting…', {
      fontSize: '13px', color: '#aaaaaa', align: 'center',
    }).setOrigin(0.5, 0);
    this.infoPanel.add(sub);

    // Equivalences grid
    const rowH   = 38;
    const startY = -PH / 2 + 132;
    const eqs     = MainScene.CO2_EQUIVALENCES;

    eqs.forEach((eq, i) => {
      const col   = i % 2;
      const row   = Math.floor(i / 2);
      const ex    = col === 0 ? -PW / 2 + 20 : 8;
      const ey    = startY + row * rowH;
      const colW  = PW / 2 - 28;

      const count = totalKg / eq.kgPerUnit;
      const countStr = count >= 10000
        ? `${(count / 1000).toFixed(1)}k`
        : count >= 1
          ? count.toFixed(count < 10 ? 1 : 0)
          : count < 0.1
            ? '< 0.1'
            : count.toFixed(2);

      // Row background (alternating)
      const rowBg = this.add.graphics();
      rowBg.fillStyle(row % 2 === 0 ? 0x112211 : 0x0d1d0d, 0.6);
      rowBg.fillRoundedRect(ex - 6, ey - 4, colW, rowH - 4, 6);
      this.infoPanel!.add(rowBg);

      const rowText = this.add.text(
        ex + 4, ey + rowH / 2 - 10,
        `${eq.emoji}  ${countStr} ${countStr === '1.0' || countStr === '1' ? eq.unit : eq.unit + 's'}`,
        { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' },
      ).setOrigin(0, 0.5);
      this.infoPanel!.add(rowText);

      const subText = this.add.text(
        ex + 4, ey + rowH / 2 + 8,
        eq.label,
        { fontSize: '10px', color: '#88cc88' },
      ).setOrigin(0, 0.5);
      this.infoPanel!.add(subText);
    });

    // ── Wildlife disturbance section ─────────────────────────────────
    const stress = this.animalManager?.getStressStats() ?? { eventCount: 0, weightedScore: 0 };
    const stressY = PH / 2 - 100;

    const stressBg = this.add.graphics();
    stressBg.fillStyle(0x1a1000, 0.7);
    stressBg.fillRoundedRect(-PW / 2 + 14, stressY - 6, PW - 28, 56, 8);
    stressBg.lineStyle(1, 0x886600, 0.5);
    stressBg.strokeRoundedRect(-PW / 2 + 14, stressY - 6, PW - 28, 56, 8);
    this.infoPanel!.add(stressBg);

    const stressTitle = this.add.text(-PW / 2 + 22, stressY + 4,
      '🐾  Wildlife disturbance', {
      fontSize: '13px', color: '#ffcc44', fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.infoPanel!.add(stressTitle);

    const evtLabel = stress.eventCount === 0
      ? 'No animals startled yet — your forest is undisturbed 🌿'
      : `${stress.eventCount} startle event${stress.eventCount === 1 ? '' : 's'}  ·  disturbance index: ${stress.weightedScore.toFixed(1)}  (higher = closer to planted trees)`;

    const stressDetail = this.add.text(-PW / 2 + 22, stressY + 26,
      evtLabel, {
      fontSize: '11px', color: '#ccaa66',
      wordWrap: { width: PW - 52 },
    }).setOrigin(0, 0.5);
    this.infoPanel!.add(stressDetail);

    // Sources note
    const sources = this.add.text(0, PH / 2 - 38,
      'Sources: IPCC, OurWorldInData, BBC Climate, Carbon Trust (estimates vary)', {
      fontSize: '9px', color: '#556655', align: 'center',
    }).setOrigin(0.5, 1);
    this.infoPanel.add(sources);

    // Keyboard reference + close hint
    const closeHint = this.add.text(0, PH / 2 - 14,
      'I  impact panel  ·  A  toggle ages  ·  click name  ·  1-5  tree type  ·  Arrows  move', {
      fontSize: '10px', color: '#667766', align: 'center',
    }).setOrigin(0.5, 1);
    this.infoPanel.add(closeHint);
  }

  private showTooltip(x: number, y: number, text: string): void {
    this.hideTooltip();
    this.tooltip = this.add.text(x, y - 4, text, {
      fontSize: '12px', color: '#ffffff',
      backgroundColor: '#000000dd',
      padding: { x: 7, y: 5 },
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(3000);
  }

  private hideTooltip(): void {
    this.tooltip?.destroy();
    this.tooltip = undefined;
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
      if (e.key === 'Escape') this.savePlayerName(this.playerName);
    });
    save?.addEventListener('click', () => this.savePlayerName(inp?.value ?? ''));
    skip?.addEventListener('click', () => this.savePlayerName(this.playerName));
  }

  private savePlayerName(name: string): void {
    this.playerName = name.trim();
    this.updatePlayerNameText();
    this.saveGameState();
    this.nameInput?.destroy();
    this.nameInput = undefined;
    this.nameInputActive = false;
    // Return focus to canvas so keyboard shortcuts work immediately after closing
    this.game.canvas.focus();
  }

  private updatePlayerNameText(): void {
    if (!this.playerNameText) return;
    if (this.playerName) {
      this.playerNameText.setText(`✏  ${this.playerName}`);
      this.playerNameText.setStyle({ color: '#ffffff' });
    } else {
      this.playerNameText.setText('✏  enter player name');
      this.playerNameText.setStyle({ color: '#aabbaa' });
    }
  }

  // ── Tree placement ─────────────────────────────────────────────────

  private placeTree(gx: number, gy: number): void {

    // Prevent stacking — one tree per grid cell
    if (this.trees.some(t => t.treeData.x === gx && t.treeData.y === gy)) return;

    const data: TreeData = {
      id: `tree-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      x: gx, y: gy, age: 0,
      species: this.selectedSpecies,
      playerName: this.playerName || 'Anonymous',
      plantedAt: Date.now(),
    };
    const tree = new Tree(this, data);
    tree.setAgeVisible(this.showAgeLabels);
    this.trees.push(tree);
    this.animalManager?.sync(this.trees);
    this.animalManager?.onTreePlanted(tree.x, tree.y);
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
      tree.setAgeVisible(this.showAgeLabels);
      this.trees.push(tree);
    });

    // Stashed until animalManager is created (see create())
    this.savedStressEventCount    = state.animalStressEventCount    ?? 0;
    this.savedStressWeightedScore = state.animalStressWeightedScore ?? 0;
  }

  private saveGameState(): void {
    if (!StorageManager.isAvailable()) return;
    const stress = this.animalManager?.getStressStats();
    const state: GameState = {
      playerName: this.playerName,
      trees: this.trees.map(t => t.treeData),
      lastUpdated: Date.now(),
      animalStressEventCount:    stress?.eventCount    ?? 0,
      animalStressWeightedScore: stress?.weightedScore ?? 0,
    };
    StorageManager.save(state);
  }

  // ── Game loop ──────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    if (!this.nameInputActive && this.cursors) {
      const cam = this.cameras.main;
      if (this.cursors.left.isDown)  cam.scrollX -= this.CAM_SPEED;
      if (this.cursors.right.isDown) cam.scrollX += this.CAM_SPEED;
      if (this.cursors.up.isDown)    cam.scrollY -= this.CAM_SPEED;
      if (this.cursors.down.isDown)  cam.scrollY += this.CAM_SPEED;
    }
    this.animalManager?.update(delta, this.trees);
  }
}
