---
name: Battle Animations & Timing
description: Guide for maintaining and adding new battle animations, focusing on specific sequence timing (Entry, Hits, Faints).
---

# Battle Animations & Timing Guide

## Description
This guide ensures that all battle animations (Entry, Attack hits, Fainting, Switching) maintain the authentic G/S feel by respecting specific sequence timings and CSS class interactions.

## Core Visual Utilities
- **`UI.resetSprite(el)`**: Always call this before a new major animation to clear leftover transitions/classes.
- **`UI.forceReflow(el)`**: Essential when changing a property (like `opacity: 0`) and immediately starting a transition.
- **`wait(ms)`**: Use for sequential blocking pauses.

## The "Universal Entry" Sequence
For all cases where a Pokémon is sent out (Battle Start, Switch, Replacement):
1. **Dialogue First**: Show the "Go! [Name]!" text first.
2. **Setup**: 
   - `UI.resetSprite(sprite)`
   - `sprite.style.opacity = 0` (Start hidden)
   - `UI.forceReflow(sprite)`
3. **The Reveal**:
   - `AudioEngine.playSfx('ball')`
   - `UI.spawnSmoke(x, y)`
   - `sprite.classList.add('anim-enter')`
   - `sprite.style.opacity = 1` (Ensure it reveals with the grow anim)
4. **The Cry**: Wait `~300ms` (mid-growth) then `AudioEngine.playCry(mon.cry)`.
5. **The HUD**: Wait until growth finishes (`~1000ms` total), then `"swoosh"` in the HUD.

## Attack Hit Sequence
1. **Move Name**: `UI.typeText` the move name.
2. **Visual FX**: Trigger `BattleAnims.triggerMoveFx` (or specific CSS class).
3. **The Hit**:
   - `AudioEngine.playSfx('hit' / 'hit_super' / 'hit_weak')`
   - `sprite.classList.add('anim-hit')`
4. **HP Bar**: Trigger the HP decrease animation *after* the hit flicker.

## Fainting Sequence
1. **Text**: "[Name] fainted!"
2. **Audio**: Play faint SFX and faint cry (if implemented).
3. **The Slide**: `sprite.classList.add('anim-faint')`.
4. **Cleanup**: Hide HUD and remove the sprite after the animation completes (`~600ms`).

## Best Practices
- **Never skip `UI.forceReflow`** when toggling visibility/classes in the same execution block; otherwise, the browser might optimize away the starting state.
- **Keep timings consistent**: Use the `ANIM` constants in `js/data/constants.js`.
- **CSS Transitions**: Most sprite transitions should be `0.2s` for opacity and `0.4s` for transform/filter.
