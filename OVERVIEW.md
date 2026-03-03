# OVERVIEW.md

<!--
This is the high-level context document. Agents read this during planning
to keep the project vision front and center.

Document separation:
- OVERVIEW.md: What & why we're building (stable) - read during planning
- CONTEXT_PACK.md: How to work here (operational) - read at session start
- STATUS.md: What's happening now (dynamic) - read at session start
-->

## What We're Building

Virtual Tree is an isometric web game where players can plan, plant, and grow virtual trees on a large scrollable terrain. Each player enters their name, and their trees are tagged and tracked. As trees grow, players accumulate CO2 scores that represent the environmental impact of their virtual forest. The game features a beautiful, green-themed visual design with game-like graphics that make environmental awareness fun and engaging.

The initial version supports local play with browser-based storage. Future versions will enable players to see other people's trees, names, and compete on high score leaderboards. The terrain is organized into "areas" to support multiplayer gameplay without chaos.

## Why It Matters

Climate change awareness is critical, but traditional educational approaches can feel dry or overwhelming. Virtual Tree gamifies environmental consciousness, making it fun and interactive. Players learn about CO2 impact through gameplay, creating an emotional connection to environmental issues. The visual representation of growing trees provides immediate, satisfying feedback that reinforces positive environmental behaviors.

This game is for anyone who wants to engage with environmental topics in a playful, non-preachy way. It's particularly valuable for younger audiences who respond well to gamification, but also appeals to adults who want a relaxing, meaningful gaming experience.

## Core Capabilities

- [ ] User can enter their name and have it associated with their trees
- [ ] User can plan and place trees on a large scrollable isometric terrain
- [ ] System tracks CO2 scores that accumulate as trees grow
- [ ] System displays CO2 score prominently to the player
- [ ] Terrain is organized into areas for multiplayer organization
- [ ] Game state persists in browser LocalStorage
- [ ] Game runs smoothly at 60 FPS with responsive controls
- [ ] Game is mobile-friendly and works on touch devices

## In Scope / Out of Scope

**In scope (MVP):**
- Isometric terrain rendering with scrolling
- Tree placement and growth mechanics
- CO2 score calculation and display
- Player name input and tagging
- Local storage persistence
- Area-based terrain organization
- Mobile-responsive design
- Green/cool visual theme

**Out of scope (for now):**
- Multiplayer backend (high scores, shared trees)
- Real-time multiplayer interactions
- Social features (sharing, comments)
- Advanced tree customization
- Multiple tree species
- Weather/seasons affecting growth
- In-app purchases or monetization

## Success Looks Like

Players find the game fun and engaging, returning to check on their trees and plan new ones. The CO2 scoring system feels meaningful and educational without being preachy. The visual design is polished and "juicy" (satisfying feedback, smooth animations). The game runs smoothly on both desktop and mobile devices. Players understand the connection between their virtual trees and real-world environmental impact.

Success metrics:
- Players return to check on trees multiple times
- Positive feedback on visual design and "game feel"
- Smooth 60 FPS performance on target devices
- Clear understanding of CO2 scoring system
- Game state persists reliably across sessions

## Guiding Principles

- **Fun first**: Environmental education through engaging gameplay, not lectures
- **Visual polish**: Green, cool-looking graphics that feel like a real game
- **Mobile-friendly**: Works well on touch devices, responsive design
- **Local-first**: MVP uses browser storage, no backend required initially
- **Performance**: 60 FPS target, smooth scrolling, frame-rate independent logic
- **Accessibility**: Clear UI, readable text, intuitive controls
- **Privacy**: No external data collection in MVP, names stored locally only
