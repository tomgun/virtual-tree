<!-- migration-id: 001 -->
<!-- date: 2026-03-03 -->
<!-- author: Tomas Günther -->
<!-- type: feature -->

# Migration 001: Add initial acceptance criteria for F-0001 through F-0010

## Context & Why

First-time creation of acceptance criteria files. When the formal profile was
initialised the `spec/acceptance/` directory was scaffolded but the individual
`F-####.md` files were never written. This migration creates them for every
feature registered in FEATURES.md and updates their statuses to reflect the
implementation that already exists.

## Changes

### Features Added / Updated

- F-0001: Project Setup — acceptance file created; status updated to `shipped`
- F-0002: Basic Phaser 3 Project Structure — acceptance file created; status updated to `shipped`
- F-0003: Isometric Terrain Rendering — acceptance file created; status updated to `shipped`
- F-0004: Tree Placement System — acceptance file created; status updated to `shipped`
- F-0005: CO2 Scoring System — acceptance file created; status updated to `shipped`
- F-0006: Player Name Input and Tagging — acceptance file created; status updated to `shipped`
- F-0007: LocalStorage Persistence — acceptance file created; status updated to `shipped`
- F-0008: Minimap Navigation — new feature entry + acceptance file; status `shipped`
- F-0009: Responsive UI Layout — new feature entry + acceptance file; status `in_progress`
- F-0010: Mobile / Touch Support — new feature entry + acceptance file; status `planned`

## Dependencies

- **Requires**: None
- **Blocks**: None
- **Related**: All features F-0001 through F-0010

## Acceptance Criteria

- [x] spec/acceptance/F-0001.md exists with concrete checkable criteria
- [x] spec/acceptance/F-0002.md exists with concrete checkable criteria
- [x] spec/acceptance/F-0003.md exists with concrete checkable criteria
- [x] spec/acceptance/F-0004.md exists with concrete checkable criteria
- [x] spec/acceptance/F-0005.md exists with concrete checkable criteria
- [x] spec/acceptance/F-0006.md exists with concrete checkable criteria
- [x] spec/acceptance/F-0007.md exists with concrete checkable criteria
- [x] spec/acceptance/F-0008.md exists with concrete checkable criteria
- [x] spec/acceptance/F-0009.md exists with concrete checkable criteria
- [x] spec/acceptance/F-0010.md exists with concrete checkable criteria
- [x] FEATURES.md statuses match implementation reality

## Rollback Plan

1. Delete `spec/acceptance/F-0001.md` through `spec/acceptance/F-0010.md`
2. Revert `spec/FEATURES.md` to previous version
3. Delete this migration file and update `spec/migrations/_index.json`

## Related Files

- `spec/acceptance/F-0001.md` - Created
- `spec/acceptance/F-0002.md` - Created
- `spec/acceptance/F-0003.md` - Created
- `spec/acceptance/F-0004.md` - Created
- `spec/acceptance/F-0005.md` - Created
- `spec/acceptance/F-0006.md` - Created
- `spec/acceptance/F-0007.md` - Created
- `spec/acceptance/F-0008.md` - Created
- `spec/acceptance/F-0009.md` - Created
- `spec/acceptance/F-0010.md` - Created
- `spec/FEATURES.md` - Updated statuses and added F-0008 through F-0010
