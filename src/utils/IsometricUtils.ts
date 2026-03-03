/**
 * Isometric grid constants and coordinate utilities.
 *
 * Grid tiles are drawn as diamonds with:
 *   full width  = TILE_W pixels
 *   full height = TILE_H pixels  (2:1 ratio = classic isometric)
 *
 * Grid position (gx, gy) → world (screen) position:
 *   worldX = ORIGIN_X + (gx - gy) * TILE_W / 2
 *   worldY =            (gx + gy) * TILE_H / 2
 *
 * Adjacent tiles then share exact edges (proven below):
 *   Tile (0,0) right  corner → (TILE_W/2, 0)
 *   Tile (1,0) top    corner → (TILE_W/2, 0)  ✓ same point
 *   Tile (0,0) bottom corner → (0, TILE_H/2)
 *   Tile (1,0) left   corner → (0, TILE_H/2)  ✓ same point
 */

export const TILE_W = 128;    // tile diamond full width  (pixels)
export const TILE_H = 64;     // tile diamond full height (pixels) – must be TILE_W/2
export const GRID_COLS = 40;
export const GRID_ROWS = 40;

// Horizontal world offset so the leftmost tile vertex starts near x = 0
export const ORIGIN_X = GRID_ROWS * TILE_W / 2;

export class IsometricUtils {
  /** Grid (gx, gy) → world (screen) position (centre of diamond tile) */
  static gridToWorld(gx: number, gy: number): { x: number; y: number } {
    return {
      x: ORIGIN_X + (gx - gy) * (TILE_W / 2),
      y:            (gx + gy) * (TILE_H / 2),
    };
  }

  /** World position → fractional grid position */
  static worldToGrid(wx: number, wy: number): { x: number; y: number } {
    const dx = wx - ORIGIN_X;
    // Inverse of gridToWorld:
    //   dx = (gx - gy) * TILE_W/2  →  gx - gy = dx / (TILE_W/2)
    //   wy = (gx + gy) * TILE_H/2  →  gx + gy = wy / (TILE_H/2)
    const halfW = TILE_W / 2;
    const halfH = TILE_H / 2;
    const sum  = wy / halfH;          // gx + gy
    const diff = dx / halfW;          // gx - gy
    return {
      x: (sum + diff) / 2,
      y: (sum - diff) / 2,
    };
  }

  /** Round fractional grid position to nearest tile */
  static snapToGrid(gx: number, gy: number): { x: number; y: number } {
    return { x: Math.round(gx), y: Math.round(gy) };
  }

  /**
   * Depth value for isometric draw-order sorting.
   * Objects with a higher (gx + gy) are "in front" and must render on top.
   */
  static getDepth(gx: number, gy: number): number {
    return 10 + gx + gy; // terrain is at depth 0
  }
}
