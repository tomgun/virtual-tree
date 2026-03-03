# JOURNAL

<!-- format: journal-v0.1.0 -->

**Purpose**: Capture session-by-session progress so both humans and agents can resume work effortlessly.

📖 **For format options, examples, and guidelines, see:** `.agentic/spec/JOURNAL.reference.md`

---

## Session Log (most recent first)

<!-- Agents: Append new session entries here after meaningful work -->
<!-- Format: ### Session: YYYY-MM-DD HH:MM -->

### Session: 2026-03-03 15:37 - Project Initialization

**Why**: Initial project setup complete per init_playbook.md

**Accomplished**:
- Switched to Formal profile, filled in STACK.md with Phaser 3/TypeScript stack, created OVERVIEW.md/CONTEXT_PACK.md/STATUS.md, seeded FEATURES.md with initial features, created LICENSE (Proprietary), set up quality_checks.sh

**Next steps**:
- Set up project structure with npm/Phaser 3, create initial acceptance criteria files, begin F-0002 implementation

**Blockers**: None


### Session: 2026-03-03 15:41 - MVP Implementation

**Why**: Created working MVP version ready for GitHub Pages deployment

**Accomplished**:
- Implemented complete working game: Phaser 3 setup, isometric terrain, tree placement, CO2 scoring, player names, LocalStorage persistence, GitHub Pages deployment workflow

**Next steps**:
- Test game locally, deploy to GitHub Pages, enable Pages in repo settings

**Blockers**: None


### Session: 2026-03-03 16:48 - Isometric terrain fix

**Why**: Committing working isometric terrain state

**Accomplished**:
- Fixed terrain continuity by using solid fillRect background + tile outlines only (eliminates WebGL rasterization gaps). Fixed checkerboard optical illusion by using single grass color. Increased tree minimum size. Restarted dev server.

**Next steps**:
- Add tree types

**Blockers**: None


### Session: 2026-03-03 18:19 - Game improvements + framework setup

**Why**: Large batch of game polish plus framework initialization work

**Accomplished**:
- Added 5 tree species (Oak/Pine/Palm/Cherry/Birch) with isometric shapes; fixed toolbar/minimap click handling (screen-space hit-testing); added CO2 info panel (D key) with real-world equivalences; added ? help button; resize-aware UI repositioning; fixed keyboard shortcuts (keydown-X pattern + addCapture); fixed canvas focus issue; installed git hooks; wrote acceptance criteria F-0001-F-0010; updated FEATURES.md statuses

**Next steps**:
- Review and merge feature branch; write unit tests for CO2Calculator and IsometricUtils; consider splitting MainScene.ts into smaller modules

**Blockers**: MainScene.ts exceeds 500-line limit - needs refactoring into sub-components in a future session


### Session: 2026-03-03 18:50 - Spec sync: F-0011 to F-0015

**Why**: Spec drift: features shipped without being registered

**Accomplished**:
- Registered 5 new features (CO2 panel, species selector, age toggle, one-tree-per-cell, MainScene refactor); marked F-0009 shipped; created migration 002

**Next steps**:
- Merge PR #4; refactor MainScene.ts (F-0015); write unit tests for CO2Calculator and IsometricUtils

**Blockers**: MainScene.ts at ~700 lines keeps blocking SKIP_COMPLEXITY — F-0015 refactor is high priority


### Session: 2026-03-03 19:13 - F-0016 Forest Animals

**Why**: F-0016 shipped, all types pass, dev server updated

**Accomplished**:
- Implemented Animal entity (mouse, ant, bug) with idle/wander/dash state machine, procedural Phaser.Graphics drawing, per-frame depth sorting for tree occlusion, and AnimalManager for population sync (1 per 10 trees). Integrated into MainScene update loop.

**Next steps**:
- Review visuals in browser, test occlusion depth order, write unit tests (F-0015 still planned)

**Blockers**: None

