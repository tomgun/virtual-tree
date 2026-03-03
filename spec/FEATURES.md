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
- Status: in_progress
- Acceptance: spec/acceptance/F-0001.md
- Implementation:
  - State: partial
- Tests:
  - Unit: todo

## F-0002: Basic Phaser 3 Project Structure
- Parent: F-0001
- Dependencies: F-0001
- Status: planned
- Acceptance: spec/acceptance/F-0002.md
- Implementation:
  - State: none
- Tests:
  - Unit: todo

## F-0003: Isometric Terrain Rendering
- Parent: F-0002
- Dependencies: F-0002
- Status: planned
- Acceptance: spec/acceptance/F-0003.md
- Implementation:
  - State: none
- Tests:
  - Unit: todo

## F-0004: Tree Placement System
- Parent: F-0003
- Dependencies: F-0003
- Status: planned
- Acceptance: spec/acceptance/F-0004.md
- Implementation:
  - State: none
- Tests:
  - Unit: todo

## F-0005: CO2 Scoring System
- Parent: F-0004
- Dependencies: F-0004
- Status: planned
- Acceptance: spec/acceptance/F-0005.md
- Implementation:
  - State: none
- Tests:
  - Unit: todo

## F-0006: Player Name Input and Tagging
- Parent: F-0002
- Dependencies: F-0002
- Status: planned
- Acceptance: spec/acceptance/F-0006.md
- Implementation:
  - State: none
- Tests:
  - Unit: todo

## F-0007: LocalStorage Persistence
- Parent: F-0005
- Dependencies: F-0005, F-0006
- Status: planned
- Acceptance: spec/acceptance/F-0007.md
- Implementation:
  - State: none
- Tests:
  - Unit: todo
