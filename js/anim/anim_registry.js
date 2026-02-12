// ============================================================
// ANIM REGISTRY — Pre-Built Battle Animation Definitions
// ============================================================
// All built-in animations registered with AnimFramework.
// Add new move animations here following the pattern.
//
// Context available in callbacks:
//   ctx.attacker, ctx.defender       — Pokémon data objects
//   ctx.attackerSprite, ctx.defenderSprite — DOM elements
//   ctx.attackerPos, ctx.defenderPos — { x, y } center
//   ctx.scene, ctx.fxContainer       — DOM containers
//   ctx.isPlayerAttacker             — boolean
// ============================================================

// --- MOVE-TYPE SCREEN EFFECTS ---
// These are the classic scene-flash animations triggered by move type.
// Registered so they can be composed into more complex sequences.

AnimFramework.register('fx-fire', [
    { type: 'sfx', sound: 'fire' },
    { type: 'screenFx', class: 'fx-fire', duration: 500 },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('fx-water', [
    { type: 'sfx', sound: 'water' },
    { type: 'screenFx', class: 'fx-water', duration: 500 },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('fx-ice', [
    { type: 'sfx', sound: 'ice' },
    { type: 'screenFx', class: 'fx-ice', duration: 500 },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('fx-grass', [
    { type: 'sfx', sound: 'grass' },
    { type: 'screenFx', class: 'fx-grass', duration: 500 },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('fx-electric', [
    { type: 'sfx', sound: 'electric' },
    { type: 'screenFx', class: 'fx-electric', duration: 400 },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('fx-psychic', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'screenFx', class: 'fx-psychic', duration: 600 },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('fx-poison', [
    { type: 'sfx', sound: 'normal' },
    { type: 'screenFx', class: 'fx-poison', duration: 500 },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('fx-ground', [
    { type: 'sfx', sound: 'normal' },
    { type: 'screenFx', class: 'fx-ground', duration: 400 },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('fx-fighting', [
    { type: 'sfx', sound: 'normal' },
    { type: 'screenFx', class: 'fx-fighting', duration: 300 },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

// --- COMPLEX MOVE ANIMATIONS ---
// These demonstrate the framework's full capability.

AnimFramework.register('explosion', [
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'explosion' },
            { type: 'flash', color: 'white', duration: 300, opacity: 1 },
        ]
    },
    { type: 'cssClass', el: 'scene', class: 'fx-explosion', duration: 800 },
    { type: 'wait', ms: 200 }
]);

AnimFramework.register('rage-buildup', [
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'rumble' },
            { type: 'cssClass', el: 'scene', class: 'anim-violent', duration: 500 },
        ]
    },
]);

// --- STATUS EFFECT ANIMATIONS ---
AnimFramework.register('status-brn', [
    { type: 'sfx', sound: 'fire' },
    { type: 'cssClass', el: 'defender', class: 'status-anim-brn', duration: 600 }
]);

AnimFramework.register('status-par', [
    { type: 'sfx', sound: 'electric' },
    { type: 'cssClass', el: 'defender', class: 'status-anim-par', duration: 600 }
]);

AnimFramework.register('status-psn', [
    { type: 'sfx', sound: 'normal' },
    { type: 'cssClass', el: 'defender', class: 'status-anim-psn', duration: 600 }
]);

AnimFramework.register('status-frz', [
    { type: 'sfx', sound: 'ice' },
    { type: 'cssClass', el: 'defender', class: 'status-anim-frz', duration: 600 }
]);

AnimFramework.register('status-slp', [
    { type: 'cssClass', el: 'defender', class: 'status-anim-slp', duration: 600 }
]);

// --- BEAM-BASED ATTACKS (Examples of the beam system) ---
AnimFramework.register('beam-fire', [
    { type: 'sfx', sound: 'fire' },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 350,
        width: 8, height: 4, className: 'beam-projectile',
        beamStyles: { background: 'linear-gradient(90deg, #ff4500, #ff8c00, #ffd700)', borderRadius: '2px', boxShadow: '0 0 6px #ff4500' }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-fire', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'particles', position: 'defender', count: 10, spread: 30, duration: 500,
                particleStyles: { background: '#ff4500', boxShadow: '0 0 4px #ff8c00' }
            }
        ]
    }
]);

AnimFramework.register('beam-ice', [
    { type: 'sfx', sound: 'ice' },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 400,
        width: 8, height: 4, className: 'beam-projectile',
        beamStyles: { background: 'linear-gradient(90deg, #87ceeb, #00bfff, #e0ffff)', borderRadius: '2px', boxShadow: '0 0 6px #00bfff' }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ice', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'particles', position: 'defender', count: 12, spread: 25, duration: 600,
                particleStyles: { background: '#e0ffff', boxShadow: '0 0 4px #87ceeb' }
            }
        ]
    }
]);

AnimFramework.register('beam-electric', [
    { type: 'sfx', sound: 'electric' },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 200,
        width: 4, height: 4, className: 'beam-projectile',
        beamStyles: { background: '#ffd700', borderRadius: '50%', boxShadow: '0 0 10px #ffd700' }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-electric', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'flash', color: '#ffd700', duration: 200, opacity: 0.5 }
        ]
    }
]);

// --- STAT CHANGE ANIMATIONS ---
AnimFramework.register('stat-up', [
    { type: 'cssClass', el: 'defender', class: 'anim-stat-up', duration: 800 }
]);

AnimFramework.register('stat-down', [
    { type: 'cssClass', el: 'defender', class: 'anim-stat-down', duration: 800 }
]);

// --- STREAM-BASED MOVE ANIMATIONS ---
// 8-bit style: square pixels, hard outlines, no glow/blur.
// Fire moves use scaleStart/scaleEnd to grow flame pixels toward the target.

AnimFramework.register('flamethrower', [
    { type: 'sfx', sound: 'fire' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 18, interval: 30, spread: 14, travelTime: 350,
        size: 5, color: '#ff4500', outline: '#8b0000',
        scaleStart: 0.5, scaleEnd: 2.0
    },
    { type: 'sfx', sound: 'fire' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-fire', duration: 600 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'particles', position: 'defender', count: 8, spread: 20, duration: 400,
                particleStyles: { background: '#ffd700', border: '1px solid #ff4500' }
            }
        ]
    }
]);

AnimFramework.register('ice-beam', [
    { type: 'sfx', sound: 'ice' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 14, interval: 35, spread: 8, travelTime: 380,
        size: 4, color: '#87ceeb', outline: '#4682b4'
    },
    { type: 'sfx', sound: 'ice' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ice', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'particles', position: 'defender', count: 10, spread: 25, duration: 500,
                particleStyles: { background: '#e0ffff', border: '1px solid #87ceeb' }
            }
        ]
    }
]);

AnimFramework.register('hydro-pump', [
    { type: 'sfx', sound: 'water' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 22, interval: 25, spread: 16, travelTime: 300,
        size: 6, color: '#1e90ff', outline: '#00008b',
        scaleStart: 0.7, scaleEnd: 1.5
    },
    { type: 'sfx', sound: 'water' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-water', duration: 600 },
            { type: 'spriteShake', target: 'defender', duration: 500 },
            {
                type: 'particles', position: 'defender', count: 12, spread: 30, duration: 500,
                particleStyles: { background: '#87cefa', border: '1px solid #1e90ff' }
            }
        ]
    }
]);

AnimFramework.register('thunderbolt', [
    { type: 'sfx', sound: 'electric' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 10, interval: 20, spread: 18, travelTime: 150,
        size: 4, color: '#ffd700', outline: '#b8860b', fade: false
    },
    { type: 'sfx', sound: 'electric' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ffd700', duration: 200, opacity: 0.4 },
            { type: 'screenFx', class: 'fx-electric', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('solar-beam', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 20, interval: 25, spread: 10, travelTime: 400,
        size: 5, color: '#7fff00', outline: '#228b22',
        scaleStart: 0.6, scaleEnd: 1.6
    },
    { type: 'sfx', sound: 'grass' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-grass', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'particles', position: 'defender', count: 10, spread: 25, duration: 500,
                particleStyles: { background: '#adff2f', border: '1px solid #228b22' }
            }
        ]
    }
]);

// --- MOVE VARIANTS ---
// Weaker/stronger versions by tweaking count, size, and scaling.

AnimFramework.register('ember', [
    { type: 'sfx', sound: 'fire' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 8, interval: 40, spread: 10, travelTime: 300,
        size: 4, color: '#ff6347', outline: '#8b0000',
        scaleStart: 0.4, scaleEnd: 1.5
    },
    { type: 'sfx', sound: 'fire' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-fire', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 300 }
        ]
    }
]);

AnimFramework.register('fire-blast', [
    { type: 'sfx', sound: 'fire' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 25, interval: 20, spread: 22, travelTime: 380,
        size: 6, color: '#ff4500', outline: '#8b0000',
        scaleStart: 0.6, scaleEnd: 2.5
    },
    { type: 'sfx', sound: 'fire' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-fire', duration: 700 },
            { type: 'flash', color: '#ff4500', duration: 300, opacity: 0.3 },
            { type: 'spriteShake', target: 'defender', duration: 500 },
            {
                type: 'particles', position: 'defender', count: 15, spread: 35, duration: 600,
                particleStyles: { background: '#ffd700', border: '1px solid #ff4500' }
            }
        ]
    }
]);

AnimFramework.register('powder-snow', [
    { type: 'sfx', sound: 'ice' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 12, interval: 35, spread: 18, travelTime: 400,
        size: 3, color: '#e0ffff', outline: '#b0e0e6', fade: false
    },
    { type: 'sfx', sound: 'ice' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ice', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 300 }
        ]
    }
]);

AnimFramework.register('blizzard', [
    { type: 'sfx', sound: 'ice' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 30, interval: 18, spread: 28, travelTime: 450,
        size: 5, color: '#87ceeb', outline: '#4682b4',
        scaleStart: 0.8, scaleEnd: 1.4
    },
    { type: 'sfx', sound: 'ice' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ice', duration: 800 },
            { type: 'flash', color: '#e0ffff', duration: 400, opacity: 0.4 },
            { type: 'spriteShake', target: 'defender', duration: 600 },
            {
                type: 'particles', position: 'defender', count: 18, spread: 40, duration: 700,
                particleStyles: { background: '#f0f8ff', border: '1px solid #87ceeb' }
            }
        ]
    }
]);

// --- VOLLEY-BASED MOVE ANIMATIONS ---
// 8-bit pixel projectiles fired in quick succession.

AnimFramework.register('pin-missile', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 5, interval: 80, travelTime: 200,
        projectile: {
            width: 8, height: 3,
            styles: { background: '#f0e68c', border: '1px solid #8b7500' }
        }
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);
