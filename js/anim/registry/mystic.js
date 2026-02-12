/** @type {AnimationEngine} */

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

AnimFramework.register('hypnosis', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'wave', intensity: 3, duration: 1500, speed: 80 },
    {
        type: 'parallel', steps: [
            {
                type: 'formation', target: 'defender', pattern: 'ring',
                shape: 'spiral', particleSize: 12, color: '#f0e68c', outline: '#bdb76b',
                duration: 1200, stagger: 50
            }
        ]
    }
]);

AnimFramework.register('dream-eater', [
    { type: 'sfx', sound: 'ghost' },
    { type: 'bgColor', color: '#000', duration: 800 },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-ghost', duration: 800 },
            {
                type: 'overlay', target: 'defender', shape: 'skull',
                color: '#fff', outline: '#000', width: 40, height: 40,
                duration: 800, animation: 'fade'
            }
        ]
    },
    { type: 'sfx', sound: 'heal' },
    { type: 'flash', color: '#fff', duration: 300, opacity: 0.3 }
]);

AnimFramework.register('lick', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'normal' },
    {
        type: 'overlay', target: 'defender', shape: 'water', // Reusing water shape as generic slobber/tongue
        color: '#ff69b4', outline: '#c71585', width: 30, height: 40,
        duration: 400, animation: 'slam'
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('confuse-ray', [
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ffff00', duration: 500, opacity: 0.5 },
            { type: 'wave', intensity: 4, duration: 1000, speed: 150 },
            {
                type: 'formation', target: 'defender', pattern: 'cross',
                shape: 'star', particleSize: 10, color: '#ffd700', outline: '#000',
                duration: 800, stagger: 40
            }
        ]
    }
]);

AnimFramework.register('bite', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'normal' },
    {
        type: 'overlay', target: 'defender', shape: 'claw', // Using claw elements to simulate teeth
        color: '#000', outline: '#fff', width: 35, height: 35,
        duration: 250, animation: 'slam'
    },
    { type: 'sfx', sound: 'damage' },
    { type: 'spriteShake', target: 'defender', duration: 250 }
]);

AnimFramework.register('draco-meteor', [
    { type: 'sfx', sound: 'dragon' },
    { type: 'bgColor', color: '#ff4500', duration: 800 }, // Fiery sky
    { type: 'wait', ms: 500 }, // Meteors falling
    {
        type: 'volley', from: { x: 100, y: -50 }, to: 'defender',
        count: 8, interval: 100, travelTime: 400,
        projectile: {
            width: 20, height: 20,
            styles: { background: '#ff8c00', borderRadius: '50%', boxShadow: '0 0 10px #ff4500' }
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-dragon', duration: 600 },
            { type: 'spriteShake', target: 'defender', duration: 800 }
        ]
    }
]);

AnimFramework.register('dragon-claw', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'dragon' },
    {
        type: 'overlay', target: 'defender', shape: 'claw',
        color: '#32cd32', outline: '#006400', width: 50, height: 50,
        duration: 300, animation: 'strike'
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('outrage', [
    { type: 'sfx', sound: 'dragon' },
    {
        type: 'parallel', steps: [
            { type: 'bgColor', color: '#b22222', duration: 800 }, // Angry red
            { type: 'spriteShake', target: 'attacker', duration: 800 }, // Thrashing
            { type: 'screenFx', class: 'fx-dragon', duration: 800 }
        ]
    },
    { type: 'wait', ms: 200 },
    { type: 'spriteMove', target: 'attacker', preset: 'charge' },
    {
        type: 'overlay', target: 'defender', shape: 'claw',
        color: '#ff4500', outline: '#000', width: 60, height: 60,
        duration: 400, animation: 'slam'
    },
    { type: 'spriteShake', target: 'defender', duration: 500 }
]);


AnimFramework.register('shadow-claw', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'overlay', target: 'defender', shape: 'claw',
        color: '#483d8b', outline: '#000', width: 40, height: 40,
        duration: 300, animation: 'strike'
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('zen-headbutt', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ff69b4', duration: 300, opacity: 0.5 },
            { type: 'spriteMove', target: 'attacker', preset: 'charge' }
        ]
    },
    {
        type: 'overlay', target: 'defender', shape: 'spiral',
        color: '#fff', outline: '#ff1493', width: 40, height: 40,
        duration: 300, animation: 'slam'
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('phantom-force', [
    // 1. Vanished state (ensure hidden)
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transition = 'none';
            sprite.style.opacity = '0';
        }
    },
    { type: 'wait', ms: 500 }, // Suspense
    { type: 'sfx', sound: 'ghost' },
    // 2. Appear + Strike
    {
        type: 'parallel', steps: [
            {
                type: 'callback', fn: ctx => {
                    const sprite = ctx.attackerSprite;
                    sprite.style.opacity = '1';
                    // Maybe a filter effect?
                    sprite.style.filter = 'invert(1) drop-shadow(0 0 10px #4b0082)';
                }
            },
            { type: 'screenFx', class: 'fx-ghost', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'claw',
                color: '#4b0082', outline: '#000', width: 50, height: 50,
                duration: 300, animation: 'strike'
            }
        ]
    },
    { type: 'wait', ms: 100 },
    { type: 'spriteShake', target: 'defender', duration: 400 },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.filter = '';
        }
    }
]);

AnimFramework.register('shadow-force', [
    // Similar to Phantom Force but grander
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transition = 'none';
            sprite.style.opacity = '0';
        }
    },
    { type: 'bgColor', color: '#000', duration: 1000 }, // Total darkness
    { type: 'wait', ms: 800 },
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'parallel', steps: [
            {
                type: 'callback', fn: ctx => {
                    const sprite = ctx.attackerSprite;
                    sprite.style.opacity = '1';
                    sprite.style.filter = 'brightness(0) drop-shadow(0 0 15px #800080)'; // Shadow form
                }
            },
            { type: 'flash', color: '#4b0082', duration: 400, opacity: 0.6 },
            {
                type: 'overlay', target: 'defender', shape: 'skull',
                color: '#fff', outline: '#000', width: 80, height: 80,
                duration: 500, animation: 'slam'
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 600 },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.filter = '';
        }
    }
]);

AnimFramework.register('teleport', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transition = 'transform 0.2s, opacity 0.2s';
            sprite.style.transform = 'scale(0.1)';
            sprite.style.opacity = '0';
        }
    },
    { type: 'wait', ms: 500 },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transform = 'scale(1)';
            sprite.style.opacity = '1';
        }
    }
]);

AnimFramework.register('curse', [
    { type: 'sfx', sound: 'ghost' },
    { type: 'bgColor', color: '#1a001a', duration: 1000 },
    {
        type: 'overlay', target: 'attacker', shape: 'skull', // Attacker sacrifice (Ghost) or buff (Non-ghost)
        color: '#fff', outline: '#000', width: 40, height: 40,
        duration: 800, animation: 'fade'
    },
    // Ideally logic would split here if Ghost/Non-Ghost, but generic works
    {
        type: 'overlay', target: 'defender', shape: 'skull',
        color: '#4b0082', outline: '#000', width: 60, height: 60,
        duration: 800, animation: 'contain'
    }
]);

AnimFramework.register('nightmare', [
    { type: 'sfx', sound: 'ghost' },
    { type: 'bgColor', color: '#000', duration: 1200 },
    {
        type: 'overlay', target: 'defender', shape: 'zzz', // Sleep context
        color: '#8b0000', outline: '#000', width: 30, height: 30, // Red Zzz = Nightmare
        duration: 1000, animation: 'float', count: 5, spread: 20
    }
]);

AnimFramework.register('perish-song', [
    { type: 'sfx', sound: 'psychic' }, // Melodic but eerie
    { type: 'bgColor', color: '#2f4f4f', duration: 1500 },
    {
        type: 'formation', target: 'scene', pattern: 'ring',
        shape: 'music', particleSize: 20, color: '#000', outline: '#8b0000', // Black notes
        duration: 1500, stagger: 60
    }
]);
