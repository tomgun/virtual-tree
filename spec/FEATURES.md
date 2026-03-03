# FEATURES
<!-- spec-format: features-v0.3.1 -->

**Purpose**: A human + machine readable registry of features with stable IDs, status, and acceptance criteria.

📖 **For detailed format documentation, see:** `.agentic/spec/FEATURES.reference.md`

---

## Quick Reference

**Status**: `planned` | `in_progress` | `shipped` | `deprecated`

**Feature template** (copy/paste when adding features):

```markdown
## F-####: FeatureName
- Parent: none
- Dependencies: none
- Status: planned
- Acceptance: spec/acceptance/F-####.md
- Implementation:
  - State: none  <!-- none | partial | complete -->
- Tests:
  - Unit: todo  <!-- todo | partial | complete -->
```

---

## Features

<!-- Add feature entries below, most recent first -->

## F-0001: Project Setup
- Parent: none
- Dependencies: none
- Complexity: S
- Tags: [infrastructure, tooling]
- Status: shipped
- Acceptance: spec/acceptance/F-0001.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: package.json, tsconfig.json, vite.config.ts, .github/workflows/deploy.yml, .agentic/
- Tests:
  - Test strategy: manual
  - Unit: n/a
  - Acceptance: partial

## F-0002: Basic Phaser 3 Project Structure
- Parent: F-0001
- Dependencies: F-0001
- Complexity: S
- Tags: [game, infrastructure]
- Status: shipped
- Acceptance: spec/acceptance/F-0002.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/main.ts, src/scenes/MainScene.ts, index.html
- Tests:
  - Test strategy: manual
  - Unit: todo
  - Acceptance: partial

## F-0003: Isometric Terrain Rendering
- Parent: F-0002
- Dependencies: F-0002
- Complexity: M
- Tags: [game, rendering, isometric]
- Status: shipped
- Acceptance: spec/acceptance/F-0003.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/utils/IsometricUtils.ts, src/scenes/MainScene.ts (createTerrain)
- Tests:
  - Test strategy: unit
  - Unit: todo
  - Acceptance: partial

## F-0004: Tree Placement System
- Parent: F-0003
- Dependencies: F-0003
- Complexity: M
- Tags: [game, trees, interaction]
- Status: shipped
- Acceptance: spec/acceptance/F-0004.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/entities/Tree.ts, src/entities/IsometricTree.ts, src/types/TreeTypes.ts, src/scenes/MainScene.ts
- Tests:
  - Test strategy: unit
  - Unit: todo
  - Acceptance: partial

## F-0005: CO2 Scoring System
- Parent: F-0004
- Dependencies: F-0004
- Complexity: S
- Tags: [game, scoring, co2]
- Status: shipped
- Acceptance: spec/acceptance/F-0005.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/systems/CO2Calculator.ts, src/scenes/MainScene.ts (updateScoreDisplay)
- Tests:
  - Test strategy: unit
  - Unit: todo
  - Acceptance: partial

## F-0006: Player Name Input and Tagging
- Parent: F-0002
- Dependencies: F-0002
- Complexity: S
- Tags: [game, player, ui]
- Status: shipped
- Acceptance: spec/acceptance/F-0006.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/scenes/MainScene.ts (showNameInput, savePlayerName)
- Tests:
  - Test strategy: unit
  - Unit: todo
  - Acceptance: partial

## F-0007: LocalStorage Persistence
- Parent: F-0005
- Dependencies: F-0005, F-0006
- Complexity: S
- Tags: [data, persistence]
- Status: shipped
- Acceptance: spec/acceptance/F-0007.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/systems/StorageManager.ts, src/scenes/MainScene.ts (loadGameState, saveGameState)
- Tests:
  - Test strategy: unit
  - Unit: todo
  - Acceptance: partial

## F-0008: Minimap Navigation
- Parent: F-0002
- Dependencies: F-0002, F-0003
- Complexity: S
- Tags: [game, ui, navigation]
- Status: shipped
- Acceptance: spec/acceptance/F-0008.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/systems/Minimap.ts, src/scenes/MainScene.ts
- Tests:
  - Test strategy: manual
  - Unit: todo
  - Acceptance: partial

## F-0009: Responsive UI Layout
- Parent: F-0002
- Dependencies: F-0002
- Complexity: S
- Tags: [ui, responsive]
- Status: shipped
- Acceptance: spec/acceptance/F-0009.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/scenes/MainScene.ts (repositionUI, scale.on resize, repositionUI helper)
- Tests:
  - Test strategy: manual
  - Unit: n/a
  - Acceptance: partial

## F-0010: Mobile / Touch Support
- Parent: F-0009
- Dependencies: F-0009
- Complexity: L
- Tags: [mobile, touch, responsive]
- Priority: medium
- Status: planned
- Acceptance: spec/acceptance/F-0010.md
- Implementation:
  - State: none
- Tests:
  - Unit: todo

## F-0011: CO₂ Impact Info Panel
- Parent: F-0005
- Dependencies: F-0005
- Complexity: S
- Tags: [game, ui, co2, education]
- Status: shipped
- Acceptance: spec/acceptance/F-0011.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/scenes/MainScene.ts (buildInfoPanel, toggleInfoPanel, CO2_EQUIVALENCES)
- Tests:
  - Test strategy: manual
  - Unit: n/a
  - Acceptance: partial

## F-0012: Tree Species Selector
- Parent: F-0004
- Dependencies: F-0004
- Complexity: S
- Tags: [game, ui, trees]
- Status: shipped
- Acceptance: spec/acceptance/F-0012.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/scenes/MainScene.ts (createTreeSelector, selectSpecies, selectorRects), src/types/TreeTypes.ts
- Tests:
  - Test strategy: manual
  - Unit: n/a
  - Acceptance: partial

## F-0013: Age Label Toggle
- Parent: F-0004
- Dependencies: F-0004
- Complexity: S
- Tags: [game, ui, trees]
- Status: shipped
- Acceptance: spec/acceptance/F-0013.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/entities/Tree.ts (setAgeVisible), src/scenes/MainScene.ts (toggleAgeLabels, showAgeLabels)
- Tests:
  - Test strategy: manual
  - Unit: n/a
  - Acceptance: partial

## F-0014: One Tree Per Cell Constraint
- Parent: F-0004
- Dependencies: F-0004
- Complexity: S
- Tags: [game, trees, rules]
- Status: shipped
- Acceptance: spec/acceptance/F-0014.md
- Verification:
  - Accepted: no
- Implementation:
  - State: complete
  - Code: src/scenes/MainScene.ts (placeTree occupation check)
- Tests:
  - Test strategy: unit
  - Unit: todo
  - Acceptance: partial

## F-0015: MainScene Refactor
- Parent: F-0002
- Dependencies: F-0002
- Complexity: M
- Tags: [infrastructure, refactor]
- Priority: high
- Status: planned
- Acceptance: spec/acceptance/F-0015.md
- Implementation:
  - State: none
- Tests:
  - Unit: todo
