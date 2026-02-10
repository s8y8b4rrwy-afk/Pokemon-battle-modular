# 🚀 Future Improvements & Roadmap

This document outlines potential enhancements, technical debt, and new features for the **Pokémon G/S Battle Simulator (Modular)**.

## 🛠️ Technical Debt & Refactoring
- [ ] **CSS Modularization**: Break down the 1,900+ line `styles.css` into separate files matching the JS modules (e.g., `ui.css`, `animations.css`, `screens.css`).
- [x] **FaintManager**: Extract the fainting logic from `battle.js` and `turn_manager.js` into its own module to handle simultaneous faints, Destiny Bond, and replacement timing more cleanly.
- [ ] **VisualsManager**: Centralize all sprite manipulation, filtering, and screen-shaking into a dedicated module to further simplify `battle.js`.
- [ ] **Proper Type Serialization**: Move from global objects to a more robust state management system (perhaps a simple store pattern) to avoid direct global property access.

## ✨ New Features
- [ ] **Hold Items**: Implement Gen II held items like Leftovers, Berries, and Type-enhancing items (Never-Melt Ice, etc.).
- [ ] **Abilities (Optional Gen III+ Feature)**: While Gen II didn't have abilities, adding an optional "Legacy+" mode with simple abilities like Intimidate or Levitate could add depth.
- [ ] **2v2 Battles**: Extend the `TurnManager` to support double battles.
- [ ] **Move Animations**: Add specific visual effects for major move types (Fire, Water, Electric) instead of the generic "hit" flicker.
- [ ] **Pokédex Integration**: A screen to track which of the 251 Pokémon have been caught or encountered.

## 🎨 UI/UX Enhancements
- [ ] **Sound Settings**: Add a menu to toggle SFX/Music and adjust volumes.
- [ ] **Touch Controls**: Improve the mobile experience with visible on-screen D-pad and buttons.
- [ ] **Battle Backgrounds**: Dynamic backgrounds based on the Pokémon's location or type (e.g., Grass, Cave, Water).
- [ ] **Day/Night Cycle**: Integrate real-world time to change the battle scene palette (Golden Hour, Night, Morning).

## 📡 Systems
- [ ] **Online Multi-player**: A dedicated server to allow two players to battle using their saved parties.
- [ ] **Trading System**: Enable "Local Trade" (between tabs) or "Global Trade" with other players.
- [ ] **Trainer AI Archetypes**: Aggressive, Defensive, and Balanced AI personalities for better replayability.

---

*Compiled with ❤️ for the Pokémon development community.*
