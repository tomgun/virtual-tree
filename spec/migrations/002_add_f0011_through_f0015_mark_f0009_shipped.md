<!-- migration-id: 002 -->
<!-- date: 2026-03-03 -->
<!-- author: Tomas Günther -->
<!-- type: feature -->

# Migration 002: Add F-0011 through F-0015; mark F-0009 shipped

## Context & Why

Several features shipped since migration 001 were not tracked in FEATURES.md.
This migration registers them retroactively and updates F-0009 status to shipped.

## Changes

### Features Modified

- F-0009: Responsive UI Layout — status updated from `in_progress` to `shipped`; implementation state updated to `complete`

### Features Added

- F-0011: CO₂ Impact Info Panel — I key opens panel with 12 real-world CO₂ equivalences; status `shipped`
- F-0012: Tree Species Selector — bottom toolbar + 1-5 keyboard shortcuts; status `shipped`
- F-0013: Age Label Toggle — A key hides/shows tree age labels; status `shipped`
- F-0014: One Tree Per Cell Constraint — prevents stacking trees on same grid cell; status `shipped`
- F-0015: MainScene Refactor — planned; MainScene.ts at ~700 lines needs splitting; status `planned`

## Dependencies

- **Requires**: Migration 001 (acceptance criteria bootstrap)
- **Blocks**: None
- **Related**: F-0009, F-0011, F-0012, F-0013, F-0014, F-0015

## Acceptance Criteria

- [x] spec/acceptance/F-0011.md created
- [x] spec/acceptance/F-0012.md created
- [x] spec/acceptance/F-0013.md created
- [x] spec/acceptance/F-0014.md created
- [x] spec/acceptance/F-0015.md created
- [x] FEATURES.md reflects correct statuses for all features

## Rollback Plan

1. Delete spec/acceptance/F-0011.md through F-0015.md
2. Remove F-0011 through F-0015 entries from FEATURES.md
3. Revert F-0009 status to `in_progress`

## Related Files

- `spec/acceptance/F-0011.md` - Created
- `spec/acceptance/F-0012.md` - Created
- `spec/acceptance/F-0013.md` - Created
- `spec/acceptance/F-0014.md` - Created
- `spec/acceptance/F-0015.md` - Created
- `spec/FEATURES.md` - Updated
