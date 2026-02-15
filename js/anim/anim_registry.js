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


AnimFramework.register('fx-ice', [
    { type: 'sfx', sound: 'ice' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ice', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'invert', target: 'defender', duration: 300 },
            {
                type: 'particles', position: 'defender', count: 12, spread: 20, duration: 600,
                particleStyles: { background: '#e0ffff', border: '1px solid #87ceeb' }
            }
        ]
    }
]);

AnimFramework.register('fx-grass', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-grass', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'leaf',
                color: '#32cd32', outline: '#006400',
                width: 18, height: 18, duration: 400, animation: 'fade',
                count: 3, spread: 15
            }
        ]
    }
]);

AnimFramework.register('fx-electric', [
    { type: 'sfx', sound: 'electric' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-electric', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'lightning',
                color: '#ffd700', outline: '#b8860b',
                width: 16, height: 32, duration: 300, animation: 'strike'
            }
        ]
    }
]);

AnimFramework.register('fx-psychic', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-psychic', duration: 600 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'wave', intensity: 3, duration: 600, speed: 120 },
            {
                type: 'overlay', target: 'defender', shape: 'spiral',
                color: '#ff69b4', outline: '#c71585',
                width: 32, height: 32, duration: 500, animation: 'grow'
            }
        ]
    }
]);

AnimFramework.register('fx-poison', [
    { type: 'sfx', sound: 'poison' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-poison', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'skull',
                color: '#a040a0', outline: '#4b0082',
                width: 24, height: 24, duration: 500, animation: 'fade'
            },
            {
                type: 'particles', position: 'defender', count: 8, spread: 20, duration: 500,
                particleStyles: { background: '#a040a0', border: '1px solid #4b0082' }
            }
        ]
    }
]);

AnimFramework.register('fx-ground', [
    { type: 'sfx', sound: 'ground' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ground', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'tilt', angle: 4, duration: 300 }
        ]
    }
]);

AnimFramework.register('fx-fighting', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'fighting' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-fighting', duration: 300 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#c03028', outline: '#800000',
                width: 28, height: 28, duration: 300, animation: 'slam'
            }
        ]
    }
]);

AnimFramework.register('fx-flying', [
    { type: 'spriteMove', target: 'attacker', preset: 'jump' },
    { type: 'sfx', sound: 'flying' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-flying', duration: 300 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'tilt', angle: -3, duration: 200 }
        ]
    }
]);

AnimFramework.register('fx-bug', [
    { type: 'sfx', sound: 'bug' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-bug', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'claw',
                color: '#a8b820', outline: '#556b2f',
                width: 24, height: 24, duration: 300, animation: 'grow'
            }
        ]
    }
]);

AnimFramework.register('fx-rock', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-rock', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'tilt', angle: 6, duration: 400 },
            {
                type: 'particles', position: 'defender', count: 10, spread: 35, duration: 500,
                particleStyles: { background: '#b8a038', border: '1px solid #705848' }
            }
        ]
    }
]);

AnimFramework.register('fx-ghost', [
    { type: 'bgColor', color: '#1a0030', duration: 600 },
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ghost', duration: 600 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'skull',
                color: '#fff', outline: '#705898',
                width: 28, height: 28, duration: 600, animation: 'fade'
            }
        ]
    }
]);

AnimFramework.register('fx-dragon', [
    { type: 'sfx', sound: 'dragon' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-dragon', duration: 600 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'invert', target: 'scene', duration: 400 }
        ]
    }
]);

AnimFramework.register('fx-steel', [
    { type: 'sfx', sound: 'steel' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-steel', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'flash', color: '#fff', duration: 150, opacity: 0.4 },
            {
                type: 'particles', position: 'defender', count: 8, spread: 20, duration: 400,
                particleStyles: { background: '#c0c0c0', border: '1px solid #707070' }
            }
        ]
    }
]);

AnimFramework.register('fx-dark', [
    { type: 'bgColor', color: '#000', duration: 500 },
    { type: 'sfx', sound: 'dark' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-dark', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'invert', target: 'defender', duration: 300 }
        ]
    }
]);

AnimFramework.register('fx-normal', [
    {
        type: "spriteMove",
        target: "attacker",
        preset: "lunge"
    },
    {
        type: "sfx",
        sound: "normal"
    },
    {
        type: "parallel",
        steps: [
            {
                type: "screenFx",
                class: "fx-normal",
                duration: 300
            },
            {
                type: "spriteShake",
                target: "defender",
                duration: 400
            }
        ]
    }
]);

AnimFramework.register('fx-impact-silent', [
    { type: 'wait', ms: 100 }
]);

AnimFramework.register('confused', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 2, duration: 1000, speed: 100 },
            {
                type: 'overlay', target: 'defender', shape: 'duck',
                color: '#ffd700', outline: '#b8860b',
                width: 14, height: 14, duration: 1000, animation: 'fade',
                count: 2, spread: 20
            },
            {
                type: 'overlay', target: 'defender', shape: 'bird',
                color: '#fff', outline: '#666',
                width: 12, height: 8, duration: 1000, animation: 'fade',
                count: 2, spread: 25
            },
            {
                type: 'overlay', target: 'defender', shape: 'spiral',
                color: '#ff69b4', outline: '#c71585',
                width: 18, height: 18, duration: 1000, animation: 'fade',
                count: 1
            }
        ]
    }
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
    { type: 'sfx', sound: 'poison' },
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

AnimFramework.register('ice-beam_', [
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
            { type: 'spriteShake', target: 'defender', duration: 400 }
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
        type: 'parallel', steps: [

            {
                type: 'overlay', target: 'defender', shape: 'lightning',
                color: '#ffd700', outline: '#b8860b',
                width: 20, height: 50, duration: 400, animation: 'strike'
            },
        ]
    },
    { type: 'sfx', sound: 'electric' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-electric', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'star',
                color: '#fff', outline: '#ffd700',
                width: 16, height: 16, duration: 300, animation: 'grow',
                count: 3, spread: 15
            },
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
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 15, interval: 25, spread: 12, travelTime: 350,
        size: 6, color: '#ff4500', outline: '#8b0000',
        scaleStart: 0.6, scaleEnd: 2.0, svgShape: 'fire'
    },
    { type: 'sfx', sound: 'fire' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-fire', duration: 700 },
            { type: 'spriteShake', target: 'defender', duration: 500 },
            {
                type: 'formation', target: 'defender', pattern: 'fireBlast',
                shape: 'fire', particleSize: 8,
                color: '#ff4500', outline: '#8b0000',
                duration: 500, stagger: 25
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

// --- BATCH 1: WATER & FIRE ---

AnimFramework.register('surf', [
    { type: 'sfx', sound: 'water' },
    { type: 'bgColor', color: '#00008b', duration: 800 },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-water', duration: 800 },
            { type: 'wave', intensity: 5, duration: 800, speed: 150 },
            {
                type: 'stream', from: 'attacker', to: 'defender',
                count: 30, interval: 15, spread: 30, travelTime: 500,
                size: 8, color: '#1e90ff', outline: '#ffffff', scaleEnd: 2.0
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('waterfall', [
    { type: 'spriteMove', target: 'attacker', preset: 'jump' },
    { type: 'sfx', sound: 'water' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'water',
                color: '#1e90ff', outline: '#fff', width: 40, height: 60,
                duration: 500, animation: 'strike'
            },
            { type: 'screenFx', class: 'fx-water', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('bubble-beam', [
    { type: 'sfx', sound: 'water' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 12, interval: 60, travelTime: 300,
        projectile: {
            width: 8, height: 8,
            styles: { background: '#add8e6', border: '2px solid #1e90ff', borderRadius: '50%' }
        }
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('scald', [
    { type: 'sfx', sound: 'water' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 20, interval: 20, spread: 10, travelTime: 350,
        size: 5, color: '#87ceeb', outline: '#1e90ff'
    },
    {
        type: 'parallel', steps: [
            {
                type: 'particles', position: 'defender', count: 15, spread: 40, duration: 600,
                particleStyles: { background: '#fff', opacity: '0.6', filter: 'blur(1px)' }
            },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('crabhammer', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'water' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'claw',
                color: '#ff4500', outline: '#8b0000', width: 40, height: 40,
                duration: 400, animation: 'slam'
            },
            { type: 'sfx', sound: 'damage' },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('will-o-wisp', [
    { type: 'sfx', sound: 'fire' },
    {
        type: 'formation', target: 'defender', pattern: 'ring',
        shape: 'fire', particleSize: 10, color: '#800080', outline: '#4b0082',
        duration: 1000, stagger: 50
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-poison', duration: 500 },
            {
                type: 'overlay', target: 'defender', shape: 'fire',
                color: '#a020f0', outline: '#000', width: 20, height: 20,
                duration: 600, animation: 'grow'
            }
        ]
    }
]);

AnimFramework.register('flare-blitz', [
    { type: 'sfx', sound: 'fire' },
    { type: 'bgColor', color: '#ff4500', duration: 400 },
    { type: 'spriteMove', target: 'attacker', preset: 'charge' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-fire', duration: 600 },
            { type: 'flash', color: '#ffeb3b', duration: 300, opacity: 0.5 },
            { type: 'spriteShake', target: 'defender', duration: 500 },
            {
                type: 'formation', target: 'defender', pattern: 'fireBlast',
                shape: 'fire', particleSize: 12, color: '#ff4500', outline: '#000',
                duration: 600, stagger: 20
            }
        ]
    },
    { type: 'spriteMove', target: 'attacker', preset: 'recoil' }
]);

AnimFramework.register('fire-punch', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'fire' },
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#ff4500', outline: '#000', width: 32, height: 32,
                duration: 300, animation: 'slam'
            },
            {
                type: 'particles', position: 'defender', count: 10, spread: 25, duration: 400,
                particleStyles: { background: '#ff8c00', border: '1px solid #ff4500' }
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('sunny-day', [
    { type: 'sfx', sound: 'fire' },
    { type: 'bgColor', color: '#fff9c4', duration: 1000 },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ffeb3b', duration: 1000, opacity: 0.4 },
            {
                type: 'formation', target: 'attacker', pattern: 'rise',
                shape: 'star', color: '#ffeb3b', outline: '#fbc02d',
                particleSize: 15, duration: 1500, stagger: 100
            }
        ]
    }
]);

// --- BATCH 2: ELECTRIC, GRASS & ICE ---

AnimFramework.register('thunder', [
    { type: 'bgColor', color: '#444444', duration: 400 },
    { type: 'sfx', sound: 'electric' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ffffff', duration: 400, opacity: 0.5 },
            {
                type: 'overlay', target: 'defender', shape: 'lightning',
                color: '#ffd700', outline: '#000000', width: 40, height: 100,
                duration: 500, animation: 'strike'
            },
            { type: 'screenFx', class: 'fx-electric', duration: 600 }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 500 }
]);

AnimFramework.register('thunder-wave', [
    { type: 'sfx', sound: 'electric' },
    {
        type: 'formation', target: 'defender', pattern: 'ring',
        shape: 'lightning', particleSize: 12, color: '#ffd700', outline: '#b8860b',
        duration: 800, stagger: 40
    },
    { type: 'screenFx', class: 'fx-electric', duration: 400 }
]);

AnimFramework.register('volt-tackle', [
    { type: 'sfx', sound: 'electric' },
    { type: 'spriteMove', target: 'attacker', preset: 'charge' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-electric', duration: 500 },
            { type: 'flash', color: '#ffd700', duration: 300, opacity: 0.4 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'formation', target: 'defender', pattern: 'cross',
                shape: 'star', particleSize: 10, color: '#ffd700', outline: '#000000',
                duration: 400
            }
        ]
    },
    { type: 'spriteMove', target: 'attacker', preset: 'recoil' }
]);

AnimFramework.register('giga-drain', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'parallel', steps: [
            {
                type: 'stream', from: 'defender', to: 'attacker',
                count: 15, interval: 30, spread: 15, travelTime: 500,
                size: 6, color: '#32cd32', outline: '#006400', scaleStart: 1.0, scaleEnd: 0.5
            },
            { type: 'screenFx', class: 'fx-grass', duration: 600 },
            { type: 'spriteShake', target: 'defender', duration: 600 }
        ]
    },
    { type: 'sfx', sound: 'heal' },
    { type: 'flash', color: '#ffffff', duration: 300, opacity: 0.3 }
]);

AnimFramework.register('leaf-blade', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'grass' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'leaf',
                color: '#228b22', outline: '#000000', width: 48, height: 48,
                duration: 400, animation: 'grow'
            },
            {
                type: 'overlay', target: 'defender', shape: 'claw',
                color: '#ffffff', outline: '#006400', width: 32, height: 32,
                duration: 300, animation: 'fade'
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('razor-leaf', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 8, interval: 50, travelTime: 250,
        projectile: {
            width: 12, height: 6,
            styles: { background: '#32cd32', border: '1px solid #006400', borderRadius: '50% 0' }
        }
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('leech-seed', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 400,
        width: 10, height: 10, beamStyles: { background: '#8b4513', border: '2px solid #5d4037', borderRadius: '4px' }
    },
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'poison' },
            {
                type: 'formation', target: 'defender', pattern: 'ring',
                shape: 'leaf', particleSize: 8, color: '#228b22', duration: 800, stagger: 50
            }
        ]
    }
]);

AnimFramework.register('ice-punch', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'ice' },
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#87ceeb', outline: '#000000', width: 32, height: 32,
                duration: 300, animation: 'slam'
            },
            {
                type: 'particles', position: 'defender', count: 12, spread: 20, duration: 400,
                particleStyles: { background: '#e0ffff', border: '1px solid #87ceeb' }
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('hail', [
    { type: 'sfx', sound: 'ice' },
    { type: 'bgColor', color: '#e0f7fa', duration: 1000 },
    {
        type: 'parallel', steps: [
            {
                type: 'stream', from: { x: 160, y: -20 }, to: 'defender',
                count: 20, interval: 50, spread: 150, travelTime: 600,
                size: 4, color: '#ffffff', outline: '#87ceeb'
            },
            {
                type: 'stream', from: { x: 160, y: -20 }, to: 'attacker',
                count: 20, interval: 50, spread: 150, travelTime: 600,
                size: 4, color: '#ffffff', outline: '#87ceeb'
            }
        ]
    }
]);

AnimFramework.register('aurora-beam', [
    { type: 'sfx', sound: 'ice' },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 500,
        width: 12, height: 6, beamStyles: {
            background: 'linear-gradient(to right, #ffb3ba, #ffdfba, #ffffba, #baffc9, #bae1ff)',
            borderRadius: '4px', boxShadow: '0 0 10px #ffffff'
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#e0ffff', duration: 400, opacity: 0.3 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

// --- BATCH 3: NORMAL & FIGHTING ---

AnimFramework.register('hyper-beam', [
    { type: 'bgColor', color: '#000000', duration: 1000 },
    { type: 'sfx', sound: 'normal' },
    { type: 'wait', ms: 200 },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 800,
        width: 30, height: 15, beamStyles: {
            background: 'linear-gradient(to bottom, #ffffff, #f0f0f0, #ffffff)',
            borderRadius: '4px', boxShadow: '0 0 20px #ffffff, 0 0 40px #ffffff'
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'invert', target: 'scene', duration: 500 },
            { type: 'flash', color: '#ffffff', duration: 500, opacity: 0.8 },
            { type: 'screenFx', class: 'fx-normal', duration: 600 },
            { type: 'spriteShake', target: 'defender', duration: 600 },
            { type: 'tilt', angle: 8, duration: 400 }
        ]
    }
]);

AnimFramework.register('body-slam', [
    { type: 'spriteMove', target: 'attacker', preset: 'slam' },
    { type: 'sfx', sound: 'normal' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-normal', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'formation', target: 'defender', pattern: 'cross',
                shape: 'star', particleSize: 12, color: '#ffffff', outline: '#000000',
                duration: 400
            }
        ]
    }
]);

AnimFramework.register('double-edge', [
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteMove', target: 'attacker', preset: 'charge' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ffffff', duration: 200, opacity: 0.5 },
            { type: 'screenFx', class: 'fx-normal', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    },
    { type: 'spriteMove', target: 'attacker', preset: 'recoil' }
]);

AnimFramework.register('quick-attack', [
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 100 },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'claw', color: '#ffffff', width: 24, height: 24, duration: 200, animation: 'grow' },
            { type: 'spriteShake', target: 'defender', duration: 200 }
        ]
    }
]);

AnimFramework.register('tri-attack', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'parallel', steps: [
            {
                type: 'stream', from: 'attacker', to: 'defender',
                count: 6, interval: 40, spread: 10, travelTime: 400,
                size: 6, color: '#ff4500' // Fire
            },
            {
                type: 'stream', from: 'attacker', to: 'defender',
                count: 6, interval: 40, spread: 10, travelTime: 400,
                size: 6, color: '#87ceeb' // Ice
            },
            {
                type: 'stream', from: 'attacker', to: 'defender',
                count: 6, interval: 40, spread: 10, travelTime: 400,
                size: 6, color: '#ffd700' // Electric
            }
        ]
    },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ffffff', duration: 400, opacity: 0.4 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('stomp', [
    { type: 'spriteMove', target: 'attacker', preset: 'jump' },
    { type: 'wait', ms: 100 },
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'normal' },
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#8b4513', outline: '#000000', width: 40, height: 40,
                duration: 300, animation: 'slam'
            },
            { type: 'tilt', angle: 4, duration: 200 }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('close-combat', [
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'fighting' },
            { type: 'spriteMove', target: 'attacker', preset: 'lunge' }
        ]
    },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'fist', color: '#ff0000', width: 30, height: 30, duration: 200, animation: 'slam', count: 3, spread: 20 },
            { type: 'spriteShake', target: 'defender', duration: 200 }
        ]
    },
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'fighting' },
            { type: 'spriteMove', target: 'attacker', preset: 'lunge' }
        ]
    },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'fist', color: '#ff0000', width: 30, height: 30, duration: 200, animation: 'slam', count: 3, spread: 20 },
            { type: 'spriteShake', target: 'defender', duration: 200 }
        ]
    }
]);

AnimFramework.register('focus-blast', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 400 },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 600,
        width: 20, height: 20, beamStyles: {
            background: 'radial-gradient(circle, #e0ffff, #87ceeb, #4682b4)',
            borderRadius: '50%', boxShadow: '0 0 15px #87ceeb'
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'fighting' },
            { type: 'flash', color: '#87ceeb', duration: 500, opacity: 0.6 },
            { type: 'screenFx', class: 'fx-fighting', duration: 500 },
            { type: 'spriteShake', target: 'defender', duration: 500 }
        ]
    }
]);

AnimFramework.register('dynamic-punch', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'fighting' },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'fist', color: '#ff4500', width: 48, height: 48, duration: 400, animation: 'slam' },
            { type: 'wave', intensity: 4, duration: 800, speed: 100 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('mach-punch', [
    { type: 'sfx', sound: 'fighting' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 150 },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'fist', color: '#ffffff', width: 32, height: 32, duration: 200, animation: 'slam' },
            { type: 'spriteShake', target: 'defender', duration: 200 }
        ]
    }
]);

// --- BATCH 4: FLYING, PSYCHIC & POISON ---

AnimFramework.register('air-slash', [
    { type: 'sfx', sound: 'flying' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-flying', duration: 400 },
            { type: 'overlay', target: 'defender', shape: 'claw', color: '#ffffff', width: 40, height: 40, duration: 300, animation: 'grow' },
            { type: 'spriteShake', target: 'defender', duration: 300 }
        ]
    }
]);

AnimFramework.register('hurricane', [
    { type: 'sfx', sound: 'flying' },
    { type: 'bgColor', color: '#f5f5f5', duration: 1000 },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 6, duration: 1200, speed: 200 },
            { type: 'formation', target: 'defender', pattern: 'ring', shape: 'spiral', particleSize: 15, color: '#add8e6', duration: 1000, stagger: 30 }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 500 }
]);

AnimFramework.register('aerial-ace', [
    { type: 'spriteMove', target: 'attacker', preset: 'jump', duration: 100 },
    { type: 'sfx', sound: 'flying' },
    {
        type: 'parallel', steps: [
            { type: 'spriteMove', target: 'attacker', preset: 'lunge', x: 100, y: 0, duration: 100 },
            { type: 'overlay', target: 'defender', shape: 'claw', color: '#ffffff', outline: '#000000', width: 32, height: 32, duration: 200, animation: 'grow', count: 2, spread: 10 }
        ]
    }
]);

AnimFramework.register('psychic', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'parallel', steps: [
            { type: 'bgColor', color: '#4b0082', duration: 800 },
            { type: 'wave', intensity: 5, duration: 800, speed: 120 },
            { type: 'formation', target: 'defender', pattern: 'ring', shape: 'spiral', particleSize: 20, color: '#ff69b4', outline: '#ffffff', duration: 800, stagger: 60 }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('confusion', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 2, duration: 600, speed: 100 },
            { type: 'overlay', target: 'defender', shape: 'spiral', color: '#ff69b4', width: 24, height: 24, duration: 500, animation: 'grow' }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('psybeam', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 450,
        width: 10, height: 5, beamStyles: {
            background: 'linear-gradient(to right, #ff00ff, #800080, #ff00ff)',
            boxShadow: '0 0 8px #ff00ff', borderRadius: '2px'
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-psychic', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('psyshock', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'formation', target: 'defender', pattern: 'cross', shape: 'star', particleSize: 10, color: '#ba55d3', duration: 600, stagger: 40 },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ba55d3', duration: 300, opacity: 0.4 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('sludge-bomb', [
    { type: 'sfx', sound: 'poison' },
    {
        type: 'volley', from: 'attacker', to: 'defender', count: 6, interval: 100, travelTime: 300,
        projectile: { width: 12, height: 12, styles: { background: '#a040a0', border: '2px solid #4b0082', borderRadius: '50% 50% 40% 60%' } }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-poison', duration: 400 },
            { type: 'particles', position: 'defender', count: 10, spread: 25, duration: 400, particleStyles: { background: '#a040a0' } }
        ]
    }
]);

AnimFramework.register('toxic', [
    { type: 'sfx', sound: 'poison' },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'skull', color: '#9400d3', width: 40, height: 40, duration: 600, animation: 'fade' },
            { type: 'particles', position: 'defender', count: 12, spread: 30, duration: 800, particleStyles: { background: '#9400d3', border: '1px solid #000000' } }
        ]
    }
]);

AnimFramework.register('poison-jab', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'poison' },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'claw', color: '#a040a0', width: 30, height: 30, duration: 300, animation: 'grow' },
            { type: 'screenFx', class: 'fx-poison', duration: 300 },
            { type: 'spriteShake', target: 'defender', duration: 300 }
        ]
    }
]);

// --- BATCH 5: GROUND, ROCK, GHOST, DARK & DRAGON ---

AnimFramework.register('earthquake', [
    { type: 'sfx', sound: 'ground' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ground', duration: 1000 },
            { type: 'tilt', angle: 5, duration: 200 },
            { type: 'spriteShake', target: 'defender', duration: 1000 },
            { type: 'spriteShake', target: 'attacker', duration: 1000 }
        ]
    },
    { type: 'tilt', angle: -5, duration: 200 },
    { type: 'tilt', angle: 0, duration: 200 }
]);

AnimFramework.register('earth-power', [
    { type: 'sfx', sound: 'ground' },
    {
        type: 'formation', target: 'defender', pattern: 'rise',
        shape: 'rock', particleSize: 15, color: '#8b4513', duration: 800, stagger: 40
    },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#b8860b', duration: 300, opacity: 0.4 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('sandstorm', [
    { type: 'sfx', sound: 'ground' },
    { type: 'bgColor', color: '#f4a460', duration: 1000 },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 2, duration: 1500, speed: 180 },
            {
                type: 'stream', from: { x: -20, y: 100 }, to: { x: 340, y: 100 },
                count: 40, interval: 20, spread: 200, travelTime: 800,
                size: 3, color: '#d2b48c', outline: '#8b4513'
            }
        ]
    }
]);

AnimFramework.register('rock-slide', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'stream', from: { x: 230, y: -20 }, to: 'defender',
        count: 10, interval: 100, spread: 30, travelTime: 400,
        size: 15, color: '#b8a038', outline: '#000000', scaleStart: 1.5, scaleEnd: 1.0
    },
    {
        type: 'parallel', steps: [
            { type: 'sfx', sound: 'damage' },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'tilt', angle: 4, duration: 200 }
        ]
    }
]);

AnimFramework.register('ancient-power', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'formation', target: 'attacker', pattern: 'rise',
        shape: 'star', particleSize: 10, color: '#b8a038', duration: 1000, stagger: 100
    },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 5, interval: 150, travelTime: 500,
        size: 12, color: '#b8a038', outline: '#000000'
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('stone-edge', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'claw', color: '#b8860b', width: 50, height: 80, duration: 400, animation: 'strike' },
            { type: 'flash', color: '#ffffff', duration: 200, opacity: 0.3 }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('shadow-ball', [
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 600,
        width: 25, height: 25, beamStyles: {
            background: 'radial-gradient(circle, #9370db, #4b0082, #000000)',
            borderRadius: '50%', boxShadow: '0 0 15px #4b0082'
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'skull', color: '#ffffff', width: 30, height: 30, duration: 400, animation: 'grow' },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('night-shade', [
    { type: 'bgColor', color: '#1a0030', duration: 800 },
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'parallel', steps: [
            { type: 'invert', target: 'scene', duration: 600 },
            { type: 'overlay', target: 'defender', shape: 'skull', color: '#a040a0', width: 60, height: 60, duration: 600, animation: 'fade' }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('crunch', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'dark' },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'claw', color: '#ffffff', outline: '#000000', width: 40, height: 40, duration: 300, animation: 'slam' },
            { type: 'sfx', sound: 'damage' },
            { type: 'spriteShake', target: 'defender', duration: 300 }
        ]
    }
]);

AnimFramework.register('dark-pulse', [
    { type: 'sfx', sound: 'dark' },
    {
        type: 'formation', target: 'defender', pattern: 'ring',
        shape: 'spiral', particleSize: 15, color: '#4b0082', outline: '#000000',
        duration: 800, stagger: 40
    },
    {
        type: 'parallel', steps: [
            { type: 'bgColor', color: '#000000', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('dragon-pulse', [
    { type: 'sfx', sound: 'dragon' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 25, interval: 20, spread: 15, travelTime: 400,
        size: 8, color: '#9370db', outline: '#4b0082', scaleStart: 0.5, scaleEnd: 1.8
    },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#9370db', duration: 300, opacity: 0.4 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);
