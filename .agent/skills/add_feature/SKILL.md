---
name: Add Feature
description: Guide for adding new moves, items, or mechanics to the modular Pokemon Battle system.
---

# Adding a New Feature (Move, Item, or Mechanic)

## Description
A systematic guide to adding new content to the Pokemon Battle Modular system, ensuring all relevant files are updated and the modular structure is respected.

## Prerequisites
- **Understand the file structure**: 
  - `js/data`: Definitions (Moves, Items, Constants)
  - `js/core`: Logic (Battle flow, Mechanics, Effects)
  - `js/ui`: Visuals (Animations, Animation Framework, Menus)
  - `js/screens`: Screen modules (Party, Summary, Selection)

## Adding a New Move

### 1. Determine Move Type
- **Standard Move**: Uses existing damage/status logic (just add to PokeAPI data)
- **Unique Move**: Requires custom logic in `MOVE_DEX`

### 2. Add to MOVE_DEX (if unique)
Location: `js/data/moves.js`

```javascript
const MOVE_DEX = {
    'MOVE NAME': {
        isUnique: true,
        onHit: async (battle, user, target, weatherMod) => {
            // Your custom logic here
            
            // IMPORTANT: Return values matter!
            // - return true: Move succeeded
            // - return false: Move failed (will show "But it failed!")
            // - return 'FAIL': Move failed but already showed message
            // - return 'IMMUNE': Target is immune (already showed message)
            
            return true;
        }
    }
};
```

### 3. Common Move Patterns

#### Damage + Volatile Status (e.g., Bind, Fire Spin)
```javascript
'BIND': {
    isUnique: true,
    onHit: async (battle, user, target, weatherMod) => {
        // 1. Deal damage
        const moveData = { name: 'BIND', type: 'normal', power: 15, category: 'physical' };
        const result = await battle.handleDamageSequence(user, target, moveData, user === battle.p, weatherMod);
        
        // 2. Apply volatile if hit
        if (result.success && target.currentHp > 0) {
            target.volatiles.trapped = {
                turns: Math.floor(Math.random() * 4) + 2,
                source: user.name,
                moveName: 'BIND'
            };
            await UI.typeText(`${target.name} was trapped!`);
        }
        return result.success;
    }
}
```

#### Status Move with Immunity Check (e.g., Leech Seed)
```javascript
'LEECH SEED': {
    isUnique: true,
    onHit: async (battle, user, target) => {
        // Check immunity
        if (target.types.includes('grass')) {
            await UI.typeText("It doesn't affect\n" + target.name + "...");
            return 'IMMUNE'; // Prevents duplicate "But it failed!"
        }
        
        // Check if already applied
        if (target.volatiles.seeded) {
            await UI.typeText(`${target.name} is already\nseeded!`);
            return 'FAIL'; // Already showed message
        }
        
        // Apply volatile
        target.volatiles.seeded = { source: user === battle.p ? 'player' : 'enemy' };
        await UI.typeText(`${target.name} was seeded!`);
        return true;
    }
}
```

#### Move Requiring Last Move Tracking (e.g., Disable)
```javascript
'DISABLE': {
    isUnique: true,
    onHit: async (battle, user, target) => {
        // Check if target has used a move (tracked automatically in turn_manager.js)
        if (!target.lastMoveUsed || !target.lastMoveUsed.name) {
            await UI.typeText("But it failed!");
            return 'FAIL';
        }
        
        target.volatiles.disabled = {
            moveName: target.lastMoveUsed.name,
            turns: Math.floor(Math.random() * 4) + 4
        };
        await UI.typeText(`${target.name}'s ${target.lastMoveUsed.name}\nwas disabled!`);
        return true;
    }
}
```

### 4. Add End-of-Turn Processing (if needed)
Location: `js/core/effects.js` → `processEndTurnStatus()`

```javascript
// Example: Trapped volatile
if (mon.volatiles.trapped) {
    await wait(400);
    const trap = mon.volatiles.trapped;
    await UI.typeText(`${mon.name} is hurt by\n${trap.moveName}!`);
    const dmg = Math.floor(mon.maxHp / 16);
    await battle.applyDamage(mon, Math.max(1, dmg), 'normal');
    
    trap.turns--;
    if (trap.turns <= 0) {
        delete mon.volatiles.trapped;
        await UI.typeText(`${mon.name} was freed!`);
    }
    if (mon.currentHp <= 0) return;
}
```

### 5. Add Move Blocking Logic (if needed)
Location: `js/core/turn_manager.js` → `processAttack()`

```javascript
// Example: Prevent using disabled move
if (attacker.volatiles.disabled && attacker.volatiles.disabled.moveName === move.name) {
    await UI.typeText(`${attacker.name}'s ${move.name}\nis disabled!`);
    return;
}
```

### 6. Add Visual Animation (optional but recommended)
Location: `js/anim/anim_registry.js`

Register a custom animation for the move using the data-driven `AnimFramework`:

```javascript
AnimFramework.register('move-name', [
    { type: 'sfx', sound: 'fire' },
    { type: 'beam', from: 'attacker', to: 'defender', duration: 400,
        width: 8, height: 4,
        beamStyles: { background: '#ff4500', borderRadius: '2px' }
    },
    { type: 'parallel', steps: [
        { type: 'screenFx', class: 'fx-fire', duration: 500 },
        { type: 'spriteShake', target: 'defender', duration: 400 },
        { type: 'particles', position: 'defender', count: 10, spread: 30, duration: 500 }
    ]}
]);
```

Available step types: `sfx`, `cry`, `wait`, `screenFx`, `spriteShake`, `cssClass`, `move`, `spawn`, `particles`, `beam`, `flash`, `callback`, `parallel`.

Use `'attacker'` and `'defender'` as position/element references — the framework resolves player/enemy side automatically.

To play: `await AnimFramework.play('move-name', { attacker, defender, isPlayerAttacker });`

### 7. Update Documentation
- Add to `README.md` under appropriate section
- If new volatile status, add to volatile status list

## Adding a New Item

### 1. Add to ITEMS
Location: `js/data/items.js`

```javascript
const ITEMS = {
    'item-key': {
        name: 'Item Name',
        desc: 'Description',
        type: 'heal', // heal, revive, ball, battle
        heal: 50, // if type is heal
        img: 'url-to-sprite'
    }
};
```

### 2. Implement Usage Logic
- **Healing/Revive**: Handled automatically in `js/screens/party.js`
- **Pokéballs**: Add logic to `js/core/capture.js`
- **Battle Items**: Add logic to `js/core/battle.js` → `performItem()`

## Common Pitfalls

### ❌ Wrong Return Values
```javascript
// BAD: Returns false, will show duplicate "But it failed!"
if (target.types.includes('grass')) {
    await UI.typeText("It doesn't affect...");
    return false; // ❌ Will show "But it failed!" again
}

// GOOD: Returns 'IMMUNE' to prevent duplicate message
if (target.types.includes('grass')) {
    await UI.typeText("It doesn't affect...");
    return 'IMMUNE'; // ✅ No duplicate message
}
```

### ❌ Forgetting End-of-Turn Processing
If your volatile status needs to tick/expire, you MUST add logic to `processEndTurnStatus()` in `effects.js`.

### ❌ Not Tracking State
- Use `target.volatiles.X` for temporary effects
- Use `target.lastMoveUsed` for move history (tracked automatically)
- Use `battle.weather`, `battle.terrain` for field effects

## Testing Checklist
- [ ] Move appears in battle and can be selected
- [ ] Move executes without console errors
- [ ] Proper messages are shown (no duplicates)
- [ ] Volatile status applies correctly
- [ ] End-of-turn effects work (damage, expiration)
- [ ] Move blocking works (if applicable)
- [ ] Immunity checks work correctly
- [ ] Custom animation plays correctly (if registered)
- [ ] README is updated
