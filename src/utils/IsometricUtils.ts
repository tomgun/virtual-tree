/**
 * Utility functions for isometric coordinate conversion
 */
export class IsometricUtils {
  /**
   * Convert isometric (screen) coordinates to cartesian (world) coordinates
   */
  static isoToCart(isoX: number, isoY: number): { x: number; y: number } {
    const cartX = (2 * isoY + isoX) / 2;
    const cartY = (2 * isoY - isoX) / 2;
    return { x: cartX, y: cartY };
  }

  /**
   * Convert cartesian (world) coordinates to isometric (screen) coordinates
   */
  static cartToIso(cartX: number, cartY: number): { x: number; y: number } {
    const isoX = cartX - cartY;
    const isoY = (cartX + cartY) / 2;
    return { x: isoX, y: isoY };
  }

  /**
   * Get tile position from world coordinates
   */
  static worldToTile(worldX: number, worldY: number, tileSize: number = 64): { x: number; y: number } {
    return {
      x: Math.floor(worldX / tileSize),
      y: Math.floor(worldY / tileSize),
    };
  }

  /**
   * Get world position from tile coordinates
   */
  static tileToWorld(tileX: number, tileY: number, tileSize: number = 64): { x: number; y: number } {
    return {
      x: tileX * tileSize + tileSize / 2,
      y: tileY * tileSize + tileSize / 2,
    };
  }
}
