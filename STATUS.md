# STATUS.md

<!-- format: status-v1.0.0 -->

Purpose: the living "truth" of where the project is today.

## Quick Context
Virtual Tree is an isometric web game where players plan virtual trees, track CO2 scores, and compete on leaderboards. Built with Phaser 3, TypeScript, and deployed to GitHub Pages. (See OVERVIEW.md for details)

## Current session state (optional, for mid-session tracking)
- Working isometric terrain with seamless ground and depth-sorted trees (Updated: 2026-03-03 16:48 EET)
  - Set up npm project with Phaser 3, TypeScript, Vite
  - Implemented isometric terrain with scrolling
  - Created tree placement system
  - Implemented CO₂ scoring system
  - Added player name input and UI
  - Implemented LocalStorage persistence
  - Set up GitHub Pages deployment workflow
  - Created README and deployment docs
  - Test game locally
  - Deploy to GitHub Pages
  - Enable GitHub Pages in repository settings
  - None currently

## Current focus
- MVP complete - ready for testing and deployment

## In progress
- None (MVP features complete)

## Next up
- Testing and bug fixes
- Polish UI/UX
- Add more visual polish (better tree sprites, animations)
- Mobile touch controls optimization

## Roadmap (lightweight)
- Near-term: 
  - Set up Phaser 3 project with TypeScript
  - Implement basic isometric terrain with scrolling
  - Create tree placement mechanics
  - Build CO2 calculation system
  - Add LocalStorage persistence
- Later: 
  - Multiplayer backend integration
  - High score leaderboards
  - Social features (viewing other players' trees)
  - Advanced tree customization
  - Multiple tree species

## Known issues / risks
- Isometric rendering in Phaser 3 may require plugin or custom implementation
- Large terrain scrolling performance needs optimization
- LocalStorage size limits (5-10MB) may constrain saved game state
- Mobile touch controls need careful design

## Decisions needed
- Isometric plugin choice: Phaser Isometric plugin vs custom implementation
- Tree growth mechanics: Time-based vs interaction-based
- CO2 calculation formula: Real-world data vs simplified model
- Terrain size and area boundaries: Fixed grid vs infinite scroll

## Release notes (optional)
- <!-- bullets -->

## Retrospectives (optional)
<!-- Agent-led project health checks. See .agentic/workflows/retrospective.md -->
<!-- Uncomment after first retrospective: -->
<!-- - Last retrospective: YYYY-MM-DD (docs/retrospectives/RETRO-YYYY-MM-DD.md) -->
<!-- - Features shipped since last: [N] -->
<!-- - Next suggested: YYYY-MM-DD (or after [N] more features) -->
<!-- - Action items from last: [X completed] / [Y total] -->
