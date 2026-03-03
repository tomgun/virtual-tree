import Phaser from 'phaser';

export interface TreeData {
  id: string;
  x: number;
  y: number;
  age: number; // in days
  species: string;
  playerName: string;
  plantedAt: number; // timestamp
}

export class Tree extends Phaser.GameObjects.Container {
  public treeData: TreeData;
  private sprite: Phaser.GameObjects.Arc;
  private ageText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, data: TreeData) {
    // For now, use direct coordinates (isometric conversion can be added later)
    super(scene, data.x, data.y);

    this.treeData = data;

    // Create tree sprite (using a simple colored circle for now)
    this.sprite = scene.add.circle(0, 0, this.getTreeSize(), this.getTreeColor());
    this.add(this.sprite);

    // Add age label
    this.ageText = scene.add.text(0, -this.getTreeSize() - 10, `${data.age}d`, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    });
    this.ageText.setOrigin(0.5, 0.5);
    this.add(this.ageText);

    scene.add.existing(this);
  }

  private getTreeSize(): number {
    // Trees grow from 20px to 60px based on age
    const minSize = 20;
    const maxSize = 60;
    const maxAge = 365; // 1 year
    const growth = Math.min(this.treeData.age / maxAge, 1);
    return minSize + (maxSize - minSize) * growth;
  }

  private getTreeColor(): number {
    // Color changes from light green (young) to dark green (mature)
    const ageRatio = Math.min(this.treeData.age / 365, 1);
    if (ageRatio < 0.33) return 0x90ee90; // Light green
    if (ageRatio < 0.66) return 0x32cd32; // Lime green
    return 0x228b22; // Forest green
  }

  /**
   * Calculate CO2 contribution in kg
   */
  public getCO2Contribution(): number {
    // Simplified formula: mature tree absorbs ~22kg CO2 per year
    // We'll use age-based calculation
    const kgPerYear = 22;
    const daysPerYear = 365;
    return (this.treeData.age / daysPerYear) * kgPerYear;
  }

  /**
   * Update tree age (called periodically)
   * @param currentTime Current timestamp in milliseconds
   * @param timeMultiplier Multiplier to convert elapsed time to days (for test/prod modes)
   */
  public updateAge(currentTime: number, timeMultiplier: number = 1 / (24 * 60 * 60 * 1000)): void {
    // Calculate elapsed time in milliseconds
    const elapsedMs = currentTime - this.treeData.plantedAt;
    // Convert to days using multiplier (seconds to days)
    const daysElapsed = Math.floor((elapsedMs / 1000) * timeMultiplier);
    this.treeData.age = daysElapsed;

    // Update visual representation
    if (this.sprite) {
      this.sprite.setRadius(this.getTreeSize());
      this.sprite.setFillStyle(this.getTreeColor());
    }

    if (this.ageText) {
      this.ageText.setText(`${this.treeData.age}d`);
    }
  }

  /**
   * Get tree position in world coordinates
   */
  public getWorldPosition(): { x: number; y: number } {
    return { x: this.treeData.x, y: this.treeData.y };
  }
}
