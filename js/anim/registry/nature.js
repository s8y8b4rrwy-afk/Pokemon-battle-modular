/** @type {AnimationEngine} */

AnimFramework.register('earthquake', [
    { type: 'sfx', sound: 'ground' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ground', duration: 1000 },
            { type: 'tilt', angle: 5, duration: 200 },
            { type: 'spriteWave', target: 'defender', intensity: 4, duration: 1000, speed: 100 },
            { type: 'spriteWave', target: 'attacker', intensity: 2, duration: 1000, speed: 150 },
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
            { type: 'spriteWave', target: 'attacker', intensity: 2, duration: 1500, speed: 120 },
            { type: 'spriteWave', target: 'defender', intensity: 2, duration: 1500, speed: 120 },
            {
                type: 'stream', from: { x: -20, y: 100 }, to: { x: 340, y: 100 },
                count: 40, interval: 20, spread: 200, travelTime: 800,
                size: 3, color: '#d2b48c', outline: '#8b4513'
            }
        ]
    }
]);

AnimFramework.register('double-team', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'parallel', steps: [
            { type: 'spriteWave', target: 'attacker', intensity: 10, duration: 1000, speed: 80 },
            {
                type: 'sequence', steps: [
                    { type: 'spriteMove', target: 'attacker', x: -40, y: 0, duration: 100 },
                    { type: 'spriteGhost', target: 'attacker', color: '#ffffff', duration: 400, hold: 50 },
                    { type: 'spriteMove', target: 'attacker', x: 80, y: 0, duration: 100 },
                    { type: 'spriteGhost', target: 'attacker', color: '#ffffff', duration: 400, hold: 50 },
                    { type: 'spriteMove', target: 'attacker', x: -40, y: 0, duration: 100 },
                    { type: 'spriteGhost', target: 'attacker', color: '#ffffff', duration: 400, hold: 50 }
                ]
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
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('dig', [
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transition = 'none';
            sprite.style.transform = 'translateY(150px)'; // Underground
            sprite.style.opacity = '1';
        }
    },
    { type: 'wait', ms: 500 }, // Underground suspense
    { type: 'sfx', sound: 'ground' },
    {
        type: 'parallel', steps: [
            // Pop up
            {
                type: 'callback', fn: ctx => {
                    const sprite = ctx.attackerSprite;
                    sprite.style.transition = 'transform 0.2s ease-out';
                    sprite.style.transform = 'translateY(0)';
                }
            },
            { type: 'screenFx', class: 'fx-ground', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'particles', position: 'defender', count: 12, spread: 30, duration: 400,
                particleStyles: { background: '#d2b48c', border: '1px solid #8b4513' }
            }
        ]
    },
    { type: 'wait', ms: 200 },
    { type: 'callback', fn: ctx => { ctx.attackerSprite.style.transition = ''; ctx.attackerSprite.style.transform = ''; } }
]);

AnimFramework.register('rock-tomb', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'rock',
                color: '#8b4513', outline: '#000', width: 40, height: 40,
                duration: 600, animation: 'slam', count: 4, spread: 40
            },
            { type: 'spriteShake', target: 'defender', duration: 500 }
        ]
    }
]);

AnimFramework.register('power-gem', [
    { type: 'sfx', sound: 'rock' },
    { type: 'flash', color: '#ffd700', duration: 300, opacity: 0.4 },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 400,
        width: 12, height: 6, beamStyles: {
            background: 'linear-gradient(45deg, #ffd700, #daa520, #fff)',
            borderRadius: '2px', boxShadow: '0 0 10px #ffd700'
        }
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('leech-seed', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 8, interval: 40, spread: 20, travelTime: 500,
        size: 8, color: '#32cd32', outline: '#006400',
        offsetX: 0, offsetY: 0,
    },
    {
        type: 'overlay', target: 'defender', shape: 'leaf',
        color: '#32cd32', outline: '#006400', width: 24, height: 24,
        duration: 800, animation: 'contain'
    }
]);

AnimFramework.register('spikes', [
    { type: 'sfx', sound: 'ground' },
    {
        type: 'formation', target: 'defender', pattern: 'xShape', // Place around opponent's field
        shape: 'rock', particleSize: 10, color: '#d2b48c', outline: '#8b4513',
        duration: 800, stagger: 20
    }
]);

AnimFramework.register('stealth-rock', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'formation', target: 'defender', pattern: 'ring', // Levitating rocks
        shape: 'rock', particleSize: 12, color: '#a0522d', outline: '#000',
        duration: 1000, stagger: 40
    }
]);

// --- NEW NATURE ANIMATIONS ---

AnimFramework.register('energy-ball', [
    { type: 'sfx', sound: 'charge' },
    { type: 'flash', color: '#32cd32', duration: 400, opacity: 0.5 },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 600,
        width: 25, height: 25, beamStyles: {
            background: 'radial-gradient(circle, #7fff00, #32cd32, #006400)',
            borderRadius: '50%', boxShadow: '0 0 20px #32cd32'
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-grass', duration: 600 },
            { type: 'spriteShake', target: 'defender', duration: 500 }
        ]
    }
]);

AnimFramework.register('leaf-storm', [
    { type: 'sfx', sound: 'grass' },
    { type: 'bgColor', color: '#006400', duration: 1000 },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 5, duration: 1200, speed: 200 },
            {
                type: 'stream', from: { x: 160, y: -50 }, to: 'defender',
                count: 40, interval: 15, spread: 250, travelTime: 800,
                size: 8, color: '#32cd32', outline: '#006400', svgShape: 'leaf'
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 800 }
]);

AnimFramework.register('grass-knot', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'formation', target: 'defender', pattern: 'cross',
        shape: 'leaf', particleSize: 12, color: '#32cd32', outline: '#006400',
        duration: 800, stagger: 50
    },
    { type: 'spriteShake', target: 'defender', duration: 400 },
    { type: 'tilt', angle: 3, duration: 300 } // Tripped
]);

AnimFramework.register('sticky-web', [
    { type: 'sfx', sound: 'bug' },
    {
        type: 'formation', target: 'defender', pattern: 'ring',
        shape: 'xShape', particleSize: 10, color: '#d3d3d3', outline: '#a9a9a9', // Web-like
        duration: 2000, stagger: 100
    },
    { type: 'screenFx', class: 'fx-bug', duration: 800 }
]);

AnimFramework.register('tailwind', [
    { type: 'sfx', sound: 'flying' },
    { type: 'spriteMove', target: 'attacker', preset: 'float', duration: 800 },
    {
        type: 'stream', from: { x: -50, y: 100 }, to: { x: 350, y: 100 },
        count: 15, interval: 40, spread: 50, travelTime: 600,
        size: 4, color: '#e0ffff', outline: '#87ceeb', opacity: 0.5
    }
]);

AnimFramework.register('whirlwind', [
    { type: 'sfx', sound: 'flying' },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 4, duration: 800, speed: 300 },
            {
                type: 'stream', from: { x: 350, y: 100 }, to: { x: -50, y: 100 }, // From opponent side
                count: 30, interval: 20, spread: 200, travelTime: 500,
                size: 6, color: '#f0ffff', outline: '#b0e0e6'
            }
        ]
    },
    { type: 'spriteMove', target: 'defender', preset: 'recoil' } // Forced out
]);

AnimFramework.register('roar', [
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 400 },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 10, duration: 600, speed: 50 },
            { type: 'invert', target: 'scene', duration: 400 }
        ]
    }
]);

AnimFramework.register('megahorn', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'bug' },
    {
        type: 'overlay', target: 'defender', shape: 'claw',
        color: '#9acd32', outline: '#556b2f', width: 60, height: 60,
        duration: 300, animation: 'slam'
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('x-scissor', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'bug' },
    {
        type: 'formation', target: 'defender', pattern: 'xShape',
        shape: 'claw', particleSize: 30, color: '#9acd32', outline: '#556b2f',
        duration: 300, stagger: 0 // Instant X
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('signal-beam', [
    { type: 'sfx', sound: 'bug' },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 500,
        width: 10, height: 10, beamStyles: {
            background: 'linear-gradient(to right, #ff00ff, #00ff00, #ff00ff)', // Multi-color
            boxShadow: '0 0 10px #00ff00'
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-bug', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('quiver-dance', [
    { type: 'sfx', sound: 'bug' },
    {
        type: 'parallel', steps: [
            { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 600 },
            {
                type: 'formation', target: 'attacker', pattern: 'ring',
                shape: 'sparkle', particleSize: 10, color: '#ff69b4', outline: '#c71585',
                duration: 800, stagger: 40
            }
        ]
    }
]);

AnimFramework.register('struggle-bug', [
    { type: 'sfx', sound: 'bug' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 10, interval: 50, spread: 30, travelTime: 400,
        size: 4, color: '#9acd32', outline: '#556b2f'
    },
    { type: 'spriteShake', target: 'defender', duration: 200 }
]);

AnimFramework.register('rock-blast', [
    { type: 'sfx', sound: 'rock' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 4, interval: 150, travelTime: 300,
        projectile: {
            width: 15, height: 15,
            styles: { background: '#8b4513', borderRadius: '50%', border: '2px solid #5d4037' }
        }
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('rock-polish', [
    { type: 'sfx', sound: 'rock' },
    { type: 'flash', color: '#fff', duration: 300, opacity: 0.5 },
    { type: 'spriteMetallic', target: 'attacker', duration: 600, color: 'bronze' } // Polish look
]);

AnimFramework.register('head-smash', [
    { type: 'spriteMove', target: 'attacker', preset: 'charge' },
    { type: 'sfx', sound: 'rock' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-rock', duration: 600 },
            { type: 'tilt', angle: 8, duration: 300 },
            { type: 'spriteShake', target: 'defender', duration: 500 }
        ]
    },
    { type: 'spriteMove', target: 'attacker', preset: 'recoil' }
]);

AnimFramework.register('rollout', [
    { type: 'sfx', sound: 'rock' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 400 }, // Simulate rolling with longer lunge
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('bulldoze', [
    { type: 'spriteMove', target: 'attacker', preset: 'slam' },
    { type: 'sfx', sound: 'ground' },
    {
        type: 'parallel', steps: [
            { type: 'tilt', angle: 4, duration: 300 },
            { type: 'screenFx', class: 'fx-ground', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('mud-shot', [
    { type: 'sfx', sound: 'ground' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 3, interval: 100, travelTime: 300,
        projectile: {
            width: 12, height: 12,
            styles: { background: '#5d4037', borderRadius: '50%', border: '1px solid #3e2723' }
        }
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('magnitude', [
    { type: 'sfx', sound: 'ground' },
    { type: 'tilt', angle: 10, duration: 600 }, // High intensity
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ground', duration: 800 },
            { type: 'spriteShake', target: 'defender', duration: 600 },
            { type: 'spriteShake', target: 'attacker', duration: 600 }
        ]
    }
]);

AnimFramework.register('seed-bomb', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 1, interval: 0, travelTime: 400,
        projectile: {
            width: 20, height: 20,
            styles: { background: '#deb887', borderRadius: '50%', border: '2px solid #8b4513' }
        }
    },
    { type: 'sfx', sound: 'explosion' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ffd700', duration: 200, opacity: 0.5 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('petal-blizzard', [
    { type: 'sfx', sound: 'grass' },
    { type: 'bgColor', color: '#ffb6c1', duration: 1000 },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 50, interval: 10, spread: 250, travelTime: 600,
        size: 6, color: '#ff69b4', outline: '#c71585', svgShape: 'leaf'
    },
    { type: 'spriteShake', target: 'defender', duration: 600 }
]);

AnimFramework.register('horn-leech', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'grass' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'claw',
                color: '#32cd32', outline: '#006400', width: 30, height: 30,
                duration: 300, animation: 'strike'
            },
            { type: 'spriteShake', target: 'defender', duration: 300 }
        ]
    },
    { type: 'sfx', sound: 'heal' },
    { type: 'flash', color: '#fff', duration: 300, opacity: 0.3 }
]);
