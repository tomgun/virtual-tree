import Phaser from 'phaser';
import { Tree, TreeData } from '../entities/Tree';
import { CO2Calculator } from '../systems/CO2Calculator';
import { StorageManager, GameState } from '../systems/StorageManager';
import { GrowthConfig } from '../systems/GrowthConfig';
import { Minimap } from '../systems/Minimap';

export class MainScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private cameraSpeed: number = 5;
  private trees: Tree[] = [];
  private playerName: string = '';
  private co2Calculator: CO2Calculator;
  private scoreText?: Phaser.GameObjects.Text;
  private playerNameText?: Phaser.GameObjects.Text;
  private nameInput?: Phaser.GameObjects.DOMElement;
  private nameInputActive: boolean = false;
  private terrainSize: number = 4000;
  private minimap?: Minimap;
  private growthMultiplier: number;
  private minimapSize: number = 200;

  constructor() {
    super({ key: 'MainScene' });
    this.co2Calculator = new CO2Calculator();
    this.growthMultiplier = GrowthConfig.getTimeMultiplier();
  }

  create(): void {
    // Load game state
    this.loadGameState();

    // Create terrain
    this.createTerrain();

    // Set up camera
    this.setupCamera();

    // Set up input
    this.setupInput();

    // Create UI
    this.createUI();

    // Create minimap
    this.minimap = new Minimap(this, this.terrainSize);
    this.minimap.create(this.cameras.main.width - this.minimapSize / 2 - 20, this.minimapSize / 2 + 20);

    // If no player name, show input after a short delay
    if (!this.playerName) {
      this.time.delayedCall(500, () => {
        this.showNameInput();
      });
    }

    // Update trees age periodically (every second)
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTreesAge,
      callbackScope: this,
      loop: true,
    });

    // Update minimap periodically
    this.time.addEvent({
      delay: 500, // Update minimap twice per second for smooth updates
      callback: this.updateMinimap,
      callbackScope: this,
      loop: true,
    });
  }

  private createTerrain(): void {
    // Create large green terrain
    const terrain = this.add.rectangle(
      this.terrainSize / 2,
      this.terrainSize / 2,
      this.terrainSize,
      this.terrainSize,
      0x2d5016
    );
    terrain.setOrigin(0.5, 0.5);

    // Add grid for isometric feel
    this.createGrid(this.terrainSize, this.terrainSize, 100);
  }

  private createGrid(width: number, height: number, cellSize: number): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x3d6b2a, 0.2);

    // Draw vertical lines
    for (let x = 0; x <= width; x += cellSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, height);
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
    }

    graphics.strokePath();
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, this.terrainSize, this.terrainSize);
    this.cameras.main.centerOn(this.terrainSize / 2, this.terrainSize / 2);
  }

  private setupInput(): void {
    // Create cursor keys
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Space key for name input
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey?.on('down', () => {
      if (!this.nameInputActive) {
        this.showNameInput();
      }
    });

    // Click to place tree - use pointerdown for better responsiveness
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.nameInputActive) {
        // Allow clicking outside the input to close it
        const inputElement = document.getElementById('player-name-input');
        if (inputElement && !inputElement.contains(document.elementFromPoint(pointer.x, pointer.y))) {
          // Clicked outside input, close it if name is set
          if (this.playerName) {
            if (this.nameInput) {
              this.nameInput.destroy();
              this.nameInput = undefined;
            }
            this.nameInputActive = false;
          }
        }
        return;
      }

      // Get world coordinates from camera
      const worldX = this.cameras.main.scrollX + pointer.x;
      const worldY = this.cameras.main.scrollY + pointer.y;

      console.log('Click detected at:', worldX, worldY, 'Camera:', this.cameras.main.scrollX, this.cameras.main.scrollY); // Debug
      this.placeTree(worldX, worldY);
    });

    // Also handle pointerup for better mobile support
    this.input.on('pointerup', () => {
      if (this.nameInputActive) return;
      // Additional handling if needed
    });
  }

  private createUI(): void {
    // CO2 Score display
    this.scoreText = this.add.text(20, 20, 'CO₂ Score: 0kg', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 },
      fontStyle: 'bold',
    });
    this.scoreText.setScrollFactor(0); // Fixed to camera
    this.updateScoreDisplay();

    // Player name display
    if (this.playerName) {
      this.playerNameText = this.add.text(20, 70, `Player: ${this.playerName}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      });
      this.playerNameText.setScrollFactor(0);
    }

    // Instructions
    const modeLabel = GrowthConfig.isTestMode() 
      ? ` (TEST: ${GrowthConfig.getGrowthDescription()})` 
      : ` (PROD: ${GrowthConfig.getGrowthDescription()})`;
    const instructions = this.add.text(
      this.cameras.main.width - 20,
      20,
      `Click to plant tree\nArrow keys: Move camera\nSpace: Change name\nClick minimap to navigate${modeLabel}`,
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 8 },
        align: 'right',
      }
    );
    instructions.setOrigin(1, 0);
    instructions.setScrollFactor(0);
  }

  private showNameInput(): void {
    if (this.nameInputActive) return;

    this.nameInputActive = true;

    // Create input field
    const inputHTML = `
      <div style="background: rgba(0,0,0,0.9); padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #2d5016;">
        <p style="color: white; font-size: 18px; margin-bottom: 10px;">Enter your name:</p>
        <input type="text" id="player-name-input" style="padding: 10px; font-size: 16px; width: 200px; border-radius: 5px; border: 1px solid #ccc;" value="${this.playerName}" placeholder="Player Name" />
        <br><br>
        <button id="save-name-btn" style="padding: 10px 20px; font-size: 16px; background: #2d5016; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Save</button>
        <button id="skip-name-btn" style="padding: 10px 20px; font-size: 16px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">Skip (Use Default)</button>
      </div>
    `;

    this.nameInput = this.add.dom(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'div',
      null,
      inputHTML
    );
    this.nameInput.setScrollFactor(0);

    // Set up event listeners
    const inputElement = document.getElementById('player-name-input') as HTMLInputElement;
    const saveBtn = document.getElementById('save-name-btn') as HTMLButtonElement;
    const skipBtn = document.getElementById('skip-name-btn') as HTMLButtonElement;

    if (inputElement) {
      inputElement.focus();
      inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.savePlayerName(inputElement.value);
        }
        if (e.key === 'Escape') {
          this.savePlayerName('Player'); // Default name
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (inputElement) {
          this.savePlayerName(inputElement.value);
        }
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.savePlayerName('Player'); // Default name
      });
    }
  }

  private savePlayerName(name: string): void {
    const trimmedName = name.trim();
    // Use default if empty
    this.playerName = trimmedName || 'Player';

    // Update or create name display
    if (this.playerNameText) {
      this.playerNameText.setText(`Player: ${this.playerName}`);
    } else {
      this.playerNameText = this.add.text(20, 70, `Player: ${this.playerName}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      });
      this.playerNameText.setScrollFactor(0);
    }

    // Save game state
    this.saveGameState();

    // Remove input
    if (this.nameInput) {
      this.nameInput.destroy();
      this.nameInput = undefined;
    }
    this.nameInputActive = false;
  }

  private placeTree(x: number, y: number): void {
    if (!this.playerName) {
      this.showNameInput();
      return;
    }

    // Ensure coordinates are within terrain bounds
    x = Phaser.Math.Clamp(x, 0, this.terrainSize);
    y = Phaser.Math.Clamp(y, 0, this.terrainSize);

    console.log('Placing tree at:', x, y); // Debug

    // Create tree data
    const treeData: TreeData = {
      id: `tree-${Date.now()}-${Math.random()}`,
      x,
      y,
      age: 0,
      species: 'oak', // Default species
      playerName: this.playerName,
      plantedAt: Date.now(),
    };

    // Create tree entity
    try {
      const tree = new Tree(this, treeData);
      this.trees.push(tree);

      console.log('Tree placed! Total trees:', this.trees.length); // Debug

      // Save game state
      this.saveGameState();

      // Update score
      this.updateScoreDisplay();
    } catch (error) {
      console.error('Error placing tree:', error);
    }
  }

  private updateTreesAge(): void {
    const currentTime = Date.now();
    this.trees.forEach((tree) => {
      tree.updateAge(currentTime, this.growthMultiplier);
    });
    this.updateScoreDisplay();
    this.saveGameState();
  }

  private updateMinimap(): void {
    if (this.minimap) {
      this.minimap.update(this.trees, this.cameras.main);
    }
  }

  private updateScoreDisplay(): void {
    if (!this.scoreText) return;

    const treeData = this.trees.map((t) => t.treeData);
    const totalCO2 = this.co2Calculator.calculateTotal(treeData);
    const formatted = this.co2Calculator.formatScore(totalCO2);

    this.scoreText.setText(`CO₂ Score: ${formatted}`);
  }

  private loadGameState(): void {
    if (!StorageManager.isAvailable()) {
      console.warn('LocalStorage not available');
      return;
    }

    const state = StorageManager.load();
    if (!state) return;

    this.playerName = state.playerName || '';

    // Restore trees
    state.trees.forEach((treeData) => {
      // Age will be recalculated in updateTreesAge with proper multiplier
      const tree = new Tree(this, treeData);
      this.trees.push(tree);
    });
  }

  private saveGameState(): void {
    if (!StorageManager.isAvailable()) {
      console.warn('LocalStorage not available');
      return;
    }

    const state: GameState = {
      playerName: this.playerName,
      trees: this.trees.map((t) => t.treeData),
      lastUpdated: Date.now(),
    };

    StorageManager.save(state);
  }

  update(): void {
    if (this.nameInputActive) return;

    // Camera movement with arrow keys
    if (this.cursors?.left.isDown) {
      this.cameras.main.scrollX -= this.cameraSpeed;
    }
    if (this.cursors?.right.isDown) {
      this.cameras.main.scrollX += this.cameraSpeed;
    }
    if (this.cursors?.up.isDown) {
      this.cameras.main.scrollY -= this.cameraSpeed;
    }
    if (this.cursors?.down.isDown) {
      this.cameras.main.scrollY += this.cameraSpeed;
    }
  }
}
