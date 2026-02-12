// ============================================================
// ANIM REGISTRY — Pre-Built Battle Animation Definitions.
// Using @type {AnimationEngine} for IntelliSense.
/** @type {AnimationEngine} */
// ============================================================

// --- MOVE-TYPE SCREEN EFFECTS ---
// These are the classic scene-flash animations triggered by move type.
// Registered so they can be composed into more complex sequences.

AnimFramework.register('fx-heal', [
    { type: 'sfx', sound: 'heal' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ffffff', duration: 450, opacity: 0.4 },
            {
                type: 'formation', target: 'defender', pattern: 'sparkle',
                shape: 'star', color: '#ffffff', outline: '#ffd700',
                particleSize: 8, duration: 800, stagger: 30
            },
            {
                type: 'particles', position: 'defender', count: 12, spread: 35, duration: 1000,
                particleStyles: { background: '#ffffff', border: '1px solid #ffd700' }
            }
        ]
    }
]);

// --- RECOVERY MOVES ---

AnimFramework.register('recover', [
    { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 400 },
    { type: 'wait', ms: 200 },
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'heal' },
            { type: 'bgColor', color: '#e6fffa', duration: 600 },
            {
                type: 'formation', target: 'attacker', pattern: 'rise',
                shape: 'star', color: '#ffffff', outline: '#32cd32',
                particleSize: 10, duration: 1000, stagger: 40
            },
            { type: 'flash', color: '#ffffff', duration: 500, opacity: 0.3 }
        ]
    }
]);

AnimFramework.register('soft-boiled', [
    { type: 'spriteMove', target: 'attacker', preset: 'jump', duration: 300 },
    { type: 'wait', ms: 100 },
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'heal' },
            {
                type: 'formation', target: 'attacker', pattern: 'ring',
                shape: 'star', color: '#fff9c4', outline: '#fbc02d',
                particleSize: 12, duration: 900, stagger: 25
            },
            { type: 'particles', position: 'attacker', count: 10, spread: 40, duration: 800 }
        ]
    }
]);

AnimFramework.register('moonlight', [
    { type: 'bgColor', color: '#000033', duration: 500 },
    { type: 'sfx', sound: 'heal' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#e0ffff', duration: 500, opacity: 0.3 },
            {
                type: 'formation', target: 'attacker', pattern: 'ring',
                shape: 'star', color: '#ffffff', outline: '#add8e6',
                particleSize: 10, duration: 1000, stagger: 30
            }
        ]
    }
]);

AnimFramework.register('synthesis', [
    { type: 'bgColor', color: '#fff9c4', duration: 400 },
    { type: 'sfx', sound: 'heal' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ffeb3b', duration: 400, opacity: 0.3 },
            {
                type: 'formation', target: 'attacker', pattern: 'rise',
                shape: 'leaf', color: '#32cd32', outline: '#006400',
                particleSize: 10, duration: 800, stagger: 20
            }
        ]
    }
]);

AnimFramework.register('fx-fire', [
    { type: 'sfx', sound: 'fire' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-fire', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'fire',
                color: '#ff4500', outline: '#8b0000',
                width: 24, height: 24, duration: 400, animation: 'grow'
            },
            {
                type: 'particles', position: 'defender', count: 8, spread: 25, duration: 500,
                particleStyles: { background: '#ffd700', border: '1px solid #ff4500' }
            }
        ]
    }
]);

AnimFramework.register('fx-water', [
    { type: 'sfx', sound: 'water' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-water', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'water',
                color: '#1e90ff', outline: '#00008b',
                width: 20, height: 20, duration: 400, animation: 'slam'
            },
            {
                type: 'particles', position: 'defender', count: 10, spread: 30, duration: 500,
                particleStyles: { background: '#87cefa', border: '1px solid #1e90ff' }
            }
        ]
    }
]);
