# CONTEXT_PACK.md

Purpose: a compact, durable starting point for any agent/human so they don’t need to reread the whole repo.

## One-minute overview
- What this repo is: An isometric web game built with Phaser 3 and TypeScript where players plan virtual trees, track CO2 scores, and compete on leaderboards. Uses browser LocalStorage for persistence, deployed to GitHub Pages.
- Main user workflow: 
  - Enter name → Place trees on terrain → Watch trees grow → Accumulate CO2 score → View high scores
- Current top priorities: 
  - Set up Phaser 3 project structure with isometric rendering
  - Implement terrain system with scrolling
  - Create tree placement and growth mechanics
  - Build CO2 scoring system
  - Add LocalStorage persistence

## Where to look first (map)
- Entry points: `src/main.ts` (game entry point), `index.html` (HTML entry)
- Core modules: 
  - `src/scenes/` - Phaser scenes (MainGame, Menu, etc.)
  - `src/entities/` - Game entities (Tree, Player, etc.)
  - `src/systems/` - Game systems (CO2Calculator, StorageManager, etc.)
  - `src/utils/` - Utility functions
- Specs: `/spec/`
- Features: `spec/FEATURES.md`
- Overview: `OVERVIEW.md` (at root)
- Non-functional requirements: `spec/NFR.md`
- Lessons: `spec/LESSONS.md`
- Decisions: `spec/adr/`
- Status: `STATUS.md`

## How to run
- Setup: `npm install`
- Run: `npm run dev` (Vite dev server)
- Test: `npm test` (Vitest in watch mode)
- Build: `npm run build` (for production)
- Preview: `npm run preview` (preview production build)

## Architecture snapshot
- Components: 
  - Phaser Game instance (main game loop)
  - Isometric Scene (terrain rendering)
  - Tree Manager (tree placement, growth, rendering)
  - CO2 Calculator (score computation)
  - Storage Manager (LocalStorage persistence)
  - UI Manager (HUD, menus, score display)
- Data flow: 
  - User input → Tree placement → Growth simulation → CO2 calculation → Score update → Storage save
  - Game load → Storage read → State restore → Render
- External dependencies: 
  - Phaser 3 (game framework)
  - LocalStorage API (persistence)
  - Future: Backend API for multiplayer (out of scope for MVP)

## Code style examples

<!--
PURPOSE: Agents mimic these patterns. One snippet > many words of description.
MAINTENANCE: Update when code style changes. Review quarterly.
ALTERNATIVE: Reference actual files: "See src/utils/helpers.py for our style"
-->

### Function style
```typescript
// Early return for edge cases
function calculateCO2Score(trees: Tree[]): number {
  if (trees.length === 0) {
    return 0;
  }

  // Clear variable names, no abbreviations
  const totalCO2 = trees.reduce((sum, tree) => sum + tree.getCO2Contribution(), 0);
  return Math.round(totalCO2 * 100) / 100; // Round to 2 decimals
}
```

### Error handling
```typescript
// Use typed errors, don't swallow silently
class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

function saveGameState(state: GameState): void {
  try {
    localStorage.setItem('gameState', JSON.stringify(state));
  } catch (error) {
    throw new StorageError(`Failed to save game state: ${error}`);
  }
}
```

### Test structure
```typescript
// TDD approach: tests written first
describe('CO2Calculator', () => {
  it('calculates CO2 score correctly for multiple trees', () => {
    const trees = [
      new Tree({ age: 1, species: 'oak' }),
      new Tree({ age: 2, species: 'pine' })
    ];
    const calculator = new CO2Calculator();
    const result = calculator.calculateTotal(trees);
    expect(result).toBe(15.5);
  });

  it('returns 0 for empty tree array', () => {
    const calculator = new CO2Calculator();
    expect(calculator.calculateTotal([])).toBe(0);
  });
});
```

<!--
WHEN TO UPDATE EXAMPLES:
- When you change coding standards
- When examples no longer match codebase
- During quarterly retrospectives

SIGNS EXAMPLES ARE STALE:
- Agent produces code that looks different from recent commits
- You keep correcting the same style issues

TIP: You can reference real files instead of inline examples:
- Function style: see src/services/billing.py:calculate_total()
- Tests: see tests/unit/test_billing.py
-->

## Quality gates (current)
- Unit tests required: yes
- Definition of Done: see `.agentic/workflows/definition_of_done.md`
- Review checklist: see `.agentic/quality/review_checklist.md`

## Documentation

<!-- List key docs in this project and what each covers. Keep short (5-8 entries).
     This helps agents know where new feature documentation should go.
     drift.sh --docs handles staleness detection separately. -->
- `README.md` — <!-- e.g., User-facing overview, install, usage -->
- `<!-- path -->` — <!-- purpose -->

## Known risks / sharp edges
- <!-- bullets -->


