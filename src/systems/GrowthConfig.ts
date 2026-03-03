/**
 * Configuration for tree growth timing
 */
export class GrowthConfig {
  // Set to true for testing (10 minutes = full growth), false for production (10 days = full growth)
  private static readonly TEST_MODE = true; // Change to false for production

  // Full growth is 365 days
  private static readonly FULL_GROWTH_DAYS = 365;

  /**
   * Get the time multiplier for growth
   * In test mode: 10 minutes = 365 days (full growth)
   * In production: 10 real days = 365 days (full growth)
   */
  public static getTimeMultiplier(): number {
    if (this.TEST_MODE) {
      // 10 minutes = 365 days, so 1 second = 365/(10*60) days
      // 10 minutes = 600 seconds
      return this.FULL_GROWTH_DAYS / (10 * 60); // ~0.608 days per second
    } else {
      // 10 real days = 365 days, so 1 second = 365/(10*24*60*60) days
      // 10 days = 864000 seconds
      return this.FULL_GROWTH_DAYS / (10 * 24 * 60 * 60); // ~0.000422 days per second
    }
  }

  /**
   * Check if we're in test mode
   */
  public static isTestMode(): boolean {
    return this.TEST_MODE;
  }

  /**
   * Get the time unit label for display
   */
  public static getTimeUnit(): string {
    return this.TEST_MODE ? 'min' : 'day';
  }

  /**
   * Get description of growth timing
   */
  public static getGrowthDescription(): string {
    if (this.TEST_MODE) {
      return '10min = full growth';
    } else {
      return '10 days = full growth';
    }
  }
}
