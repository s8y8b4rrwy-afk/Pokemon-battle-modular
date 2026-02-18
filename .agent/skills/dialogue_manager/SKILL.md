---
name: Dialogue Manager
description: Learn how to use the DialogManager system to display text, ask questions, and manage user interactions in the game.
---

# Using the Dialogue Manager

The `DialogManager` is a global system located in `js/systems/dialog_manager.js` that handles all text display, user prompts, and sequential dialogue flow. It replaces manual calls to `UI.typeText` when you need complex interactions like choices or guaranteed sequential execution.

## Core Concepts

1. **Promise-Based**: All `DialogManager` methods return a `Promise`. You **MUST** `await` them to pause execution until the dialogue is finished or a choice is made.
2. **Queue System**: The manager uses an internal queue to ensure messages play one after another, even if called simultaneously (though `await`ing is preferred).
3. **UI Locking**: Can automatically handle locking the Battle UI to prevent player movement or menu interaction during dialogue.

## 1. Displaying Text (`DialogManager.show`)

Use `DialogManager.show()` to display a standard message box. The promise resolves when the text has finished typing and (optionally) the user has pressed a key to advance.

### Basic Usage
```javascript
// Simple message that waits for user input (A/Click) to continue
await DialogManager.show("It's a critical hit!");
```

### With Options
```javascript
await DialogManager.show("The wild POKEMON fled!", {
    lock: true,      // Locks Battle.uiLocked during this message
    delay: 1000,     // Auto-advance after 1000ms (no user input required if noSkip is true)
    noSkip: true,    // User cannot skip the delay/text manually
    fast: true       // Types text at double speed
});
```

## 2. Asking Questions (`DialogManager.ask`)

Use `DialogManager.ask()` to prompt the user with a choice. This is useful for "Yes/No" questions, switching Pokemon, or learning moves.

### Basic Usage
```javascript
// Returns the string of the chosen option
const choice = await DialogManager.ask("Do you want to switch Pokemon?", ["Yes", "No"]);

if (choice === "Yes") {
    // Handle Yes
} else {
    // Handle No
}
```

### With Custom Options & Locking
```javascript
const choice = await DialogManager.ask("Teach REST to SNORLAX?", ["Yes", "No"], {
    lock: true // Prevents other inputs while the menu is open
});
```

## Configuration Options

Both `show` and `ask` accept an `options` object as the last argument:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `lock` | `boolean` | `false` | If true, sets `Battle.uiLocked = true` while the dialogue is active. Resets it to `false` (if it was false before) after completion. |
| `fast` | `boolean` | `false` | If true, the text types out significantly faster. Good for system messages. |
| `delay` | `number` | `null` | If set, the message will auto-advance after this many milliseconds. |
| `noSkip` | `boolean` | `false` | If used with `delay`, prevents the user from skipping the wait time by pressing a key. |
| `targetId` | `string` | `'text-content'` | The ID of the HTML element where the text should be typed (e.g., `'evo-text'`). |
| `arrowId` | `string` | `'advance-arrow'` | The ID of the blink-arrow element to show while waiting for input (e.g., `'evo-advance-arrow'`). |
| `parentId` | `string` | `'dialog-box'` | The container element that should parent the Yes/No choice box (e.g., `'evo-dialog'`). |

## Common Patterns

### Custom Screen Dialogue
You can use `DialogManager` on any screen by providing the relevant target IDs. This ensures consistent typing speed, sounds, and input handling across the entire game.

```javascript
const evoOptions = { 
    targetId: 'evo-text', 
    arrowId: 'evo-advance-arrow', 
    parentId: 'evo-dialog' 
};

await DialogManager.show("Congratulations!", evoOptions);
const choice = await DialogManager.ask("Learn HYPER BEAM?", ["Yes", "No"], evoOptions);
```

### Blocking Battle Flow
When implementing move logic or turn events, always `await` the dialogue to ensure the battle doesn't continue while text is typing.

```javascript
// BAD: Battle continues immediately
DialogManager.show("But it failed!");
return 'FAIL';

// GOOD: Battle pauses until user reads text
await DialogManager.show("But it failed!");
return 'FAIL';
```

### Chained Dialogue
You can simply `await` multiple calls in sequence.

```javascript
await DialogManager.show("Welcome to the gym!");
await DialogManager.show("I'm the leader here.");
const ready = await DialogManager.ask("Are you ready?", ["Yes", "No"]);
```

## Visuals
- **Text Box**: Uses the standard battle text box (`#text-content`).
- **Choice Box**: dynamic overlay that appears over the text box or action area.
- **Advance Arrow**: Automatically shown when waiting for user input.
