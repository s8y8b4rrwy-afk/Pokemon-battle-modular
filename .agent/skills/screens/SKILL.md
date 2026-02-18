---
name: Screen Management & Navigation
description: Guide for creating new screens and managing transitions using the ScreenManager framework.
---

# Screen Management & Navigation

## Description
This guide explains how to add new full-screen modules to the application using the `ScreenManager` system. This ensures consistent state management, input handling, and navigation history.

## The Screen Interface
Every screen module (e.g., `js/screens/my_screen.js`) must implement the following interface:

```javascript
const MyScreen = {
    id: 'MY_SCREEN_ID', // Used for navigation and visibility mapping

    // --- Lifecycle Methods ---

    /** @param {Object} params - Data passed from ScreenManager.push */
    onEnter(params) {
        UI.show('my-screen-element-id');
        Input.setMode('MY_MODE'); // Switch input handling to this screen
        // Initialize UI with params
    },

    onExit() {
        UI.hide('my-screen-element-id');
        // Cleanup logic if needed
    },

    onResume() {
        UI.show('my-screen-element-id');
        Input.setMode('MY_MODE', Input.focus); // Restore focus
        // Refresh data if needed
    },

    /** 
     * @param {string} key - The key pressed
     * @returns {boolean} - True if the input was handled
     */
    handleInput(key) {
        if (key === 'x' || key === 'X') {
            ScreenManager.pop();
            return true;
        }
        // Navigation logic...
        return false;
    }
};
```

## Step-by-Step: Adding a New Screen

### 1. Create the HTML Structure
Add a new `div` in `Pokemon.html`. Ensure it has the `hidden` class by default.

```html
<div id="my-screen-el" class="hidden">
    <div class="header">MY SCREEN</div>
    <!-- ... Content ... -->
</div>
```

### 2. Add Styling
Create a new CSS file (e.g., `css/my_screen.css`) and include it in `Pokemon.html`.

```css
#my-screen-el {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: #fff;
    z-index: 50; /* Above battle but below dialogue if needed */
}
```

### 3. Register with ScreenManager
Update `js/systems/screen_manager.js` to map your screen ID to the DOM element and the global object.

**Visibility Mapping (`manageVis`):**
```javascript
const map = {
    // ... items
    'MY_SCREEN_ID': 'my-screen-el'
};
```

**Object Mapping (`getScreen`):**
```javascript
switch (id) {
    // ... cases
    case 'MY_SCREEN_ID': return MyScreen;
}
```

### 4. Implement Input Handling (Optional)
If your screen needs special input logic, add a handler to `Input.handlers` in `js/systems/input.js`.

```javascript
MY_MODE: {
    handle: (key) => ScreenManager.activeScreen?.handleInput(key)
}
```

### 5. Load the Script
Add the `<script>` tag to `Pokemon.html` in the **Screens** section.

## Navigation API

Use `ScreenManager` globally to move between screens:

- `ScreenManager.push('ID', params)`: Opens a screen and keeps the previous one in history.
- `ScreenManager.pop()`: Closes the current screen and resumes the one underneath.
- `ScreenManager.replace('ID', params)`: Closes the current screen and opens a new one without growing the stack.
- `ScreenManager.clear()`: Wipes all screens. Essential when returning to the Title screen or starting a fresh Battle.

## Best Practices
- **Never call `UI.hide('screen')` manually** for navigation; use `ScreenManager.pop()`.
- **Use `onResume`** to refresh data (like HP bars or item counts) if they might have changed while a sub-screen was open.
- **Unify Text**: Use `DialogManager.show(text, { targetId: '...' })` to display text on your screen. This handles queuing, typing sounds, and advance arrows automatically. Avoid calling `UI.typeText` directly if you need sequential dialogue or input waiting.
