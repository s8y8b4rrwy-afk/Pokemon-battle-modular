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
            { type: 'wave', intensity: 5, duration: 800, speed: 120 }
        ]
    },
    { type: 'wait', ms: 200 },
    {
        type: 'parallel', steps: [
            {
                type: 'spriteSilhouette',
                target: 'defender',
                color: '#874efe',
                hold: 110,
                duration: 600,
                follow: true
            },
            {
                type: 'spriteWave',
                target: 'defender',
                intensity: 6,
                duration: 500,
                speed: 100
            }
        ]
    }
]);

AnimFramework.register('confusion', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 2, duration: 600, speed: 100 },
            { type: 'spriteWave', target: 'defender', intensity: 8, duration: 600, speed: 80 },
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
            { type: "spriteSilhouette", target: "defender", color: "#000000", duration: 800 },
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
            { type: 'overlay', target: 'defender', color: '#000000', outline: '#ffffff', width: 60, height: 60, duration: 300, animation: 'crunch', count: 2, spread: 0, stagger: 0 },
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
            { type: 'spriteWave', target: 'defender', intensity: 4, duration: 1200, speed: 150 },
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
        type: 'overlay', target: 'defender',
        color: '#000', outline: '#fff', width: 45, height: 45,
        duration: 250, animation: 'crunch', count: 2, stagger: 0
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
        duration: 300, animation: 'slash', count: 3, spread: 20, stagger: 150
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
        duration: 400, animation: 'slam', count: 4, spread: 30, stagger: 100
    },
    { type: 'spriteShake', target: 'defender', duration: 500 }
]);


AnimFramework.register('shadow-claw', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'overlay', target: 'defender', shape: 'claw',
        color: '#483d8b', outline: '#000', width: 40, height: 40,
        duration: 300, animation: 'slash', count: 3, spread: 15, stagger: 120
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
                }
            },
            { type: 'spriteSilhouette', target: 'attacker', color: '#4b0082', duration: 400, hold: 100 },
            { type: 'screenFx', class: 'fx-ghost', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'claw',
                color: '#4b0082', outline: '#000', width: 50, height: 50,
                duration: 300, animation: 'strike', count: 2, spread: 20, stagger: 150
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
                }
            },
            { type: 'spriteSilhouette', target: 'attacker', color: '#000000', duration: 800, hold: 200 },
            { type: 'flash', color: '#4b0082', duration: 400, opacity: 0.6 },
            {
                type: 'overlay', target: 'defender', shape: 'skull',
                color: '#fff', outline: '#000', width: 80, height: 80,
                duration: 500, animation: 'slam'
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 600 }
]);

AnimFramework.register('teleport', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'parallel', steps: [
            { type: 'spriteGhost', target: 'attacker', color: '#ffffff', duration: 400 },
            {
                type: 'callback', fn: ctx => {
                    const sprite = ctx.attackerSprite;
                    sprite.style.transition = 'all 0.2s';
                    sprite.style.transform = 'scale(0.1)';
                    sprite.style.opacity = '0';
                }
            }
        ]
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
        type: 'parallel', steps: [
            { type: 'spriteSilhouette', target: 'attacker', color: '#ffffff', duration: 800, hold: 200 },
            {
                type: 'overlay', target: 'attacker', shape: 'skull',
                color: '#fff', outline: '#000', width: 40, height: 40,
                duration: 800, animation: 'fade'
            },
        ]
    },
    {
        type: 'parallel', steps: [
            { type: 'spriteSilhouette', target: 'defender', color: '#4b0082', duration: 800, hold: 200 },
            {
                type: 'overlay', target: 'defender', shape: 'skull',
                color: '#4b0082', outline: '#000', width: 60, height: 60,
                duration: 800, animation: 'contain'
            }
        ]
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

// --- NEW MYSTIC ANIMATIONS ---

AnimFramework.register('trick-room', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'bgColor', color: '#800080', duration: 1500 },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 3, duration: 1500, speed: 50 },
            {
                type: 'formation', target: 'scene', pattern: 'ring', // Grid-like feel
                shape: 'square', particleSize: 8, color: '#ff00ff', outline: '#800080',
                duration: 1500, stagger: 30
            }
        ]
    }
]);

AnimFramework.register('aurora-veil', [
    { type: 'sfx', sound: 'ice' },
    { type: 'bgColor', color: '#e0ffff', duration: 1000 },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'attacker', shape: 'wall',
                color: '#e0ffff', outline: '#00ced1', width: 60, height: 60,
                duration: 1000, animation: 'contain'
            },
            {
                type: 'stream', from: { x: 0, y: -50 }, to: { x: 300, y: -50 }, // Aurora across top
                count: 30, interval: 30, spread: 20, travelTime: 800,
                size: 6, color: '#ff69b4', outline: '#00ced1' // Multi-color attempt
            }
        ]
    }
]);

AnimFramework.register('baton-pass', [
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteMove', target: 'attacker', preset: 'dodge', duration: 400 },
    {   // Throw baton
        type: 'volley', from: 'attacker', to: { x: 400, y: 100 }, // Off screen
        count: 1, interval: 0, travelTime: 300,
        projectile: { width: 15, height: 5, styles: { background: '#ff0000', transform: 'rotate(45deg)' } }
    },
    { type: 'wait', ms: 200 }
]);

AnimFramework.register('wish', [
    { type: 'sfx', sound: 'heal' },
    {
        type: 'formation', target: 'attacker', pattern: 'rise',
        shape: 'star', particleSize: 15, color: '#fffacd', outline: '#ffd700',
        duration: 2000, stagger: 100
    },
    { type: 'flash', color: '#fffacd', duration: 500, opacity: 0.4 }
]);

AnimFramework.register('healing-wish', [
    { type: 'sfx', sound: 'heal' },
    { type: 'flash', color: '#ff69b4', duration: 300, opacity: 0.5 },
    { type: 'spriteGhost', target: 'attacker', color: '#ffb6c1', duration: 800 },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.opacity = '0';
        }
    },
    { type: 'wait', ms: 500 },
    {
        type: 'callback', fn: ctx => {
            // Reset opacity handled by switch logic usually, but here for safety/visual
        }
    }
]);

AnimFramework.register('destiny-bond', [
    { type: 'sfx', sound: 'ghost' },
    { type: 'bgColor', color: '#2f002f', duration: 1000 },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 1000,
        width: 10, height: 5, beamStyles: { background: '#4b0082' }
    },
    {
        type: 'overlay', target: 'attacker', shape: 'skull',
        color: '#800080', outline: '#000', width: 40, height: 40,
        duration: 800, animation: 'fade'
    },
    {
        type: 'overlay', target: 'defender', shape: 'skull',
        color: '#800080', outline: '#000', width: 40, height: 40,
        duration: 800, animation: 'fade'
    }
]);

AnimFramework.register('aura-sphere', [
    { type: 'sfx', sound: 'charge' },
    { type: 'spriteMove', target: 'attacker', preset: 'charge', duration: 300 },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 1, interval: 0, travelTime: 500,
        projectile: {
            width: 30, height: 30,
            styles: { background: 'radial-gradient(circle, #87ceeb, #1e90ff)', borderRadius: '50%', boxShadow: '0 0 15px #1e90ff' }
        }
    },
    { type: 'sfx', sound: 'psychic' },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('stored-power', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'formation', target: 'attacker', pattern: 'rise', shape: 'star', particleSize: 10, color: '#FFD700', duration: 600, stagger: 20 },
    { type: 'wait', ms: 300 },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 500,
        width: 20, height: 20, beamStyles: { background: '#ff69b4', boxShadow: '0 0 10px #ff69b4' }
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('cosmic-power', [
    { type: 'sfx', sound: 'heal' },
    { type: 'bgColor', color: '#191970', duration: 1000 },
    {
        type: 'formation', target: 'attacker', pattern: 'ring',
        shape: 'star', particleSize: 12, color: '#87ceeb', outline: '#ffffff',
        duration: 1000, stagger: 50
    }
]);

AnimFramework.register('psycho-cut', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    {
        type: 'overlay', target: 'defender', shape: 'claw', // Using claw akin to cut
        color: '#ff00ff', outline: '#800080', width: 50, height: 50,
        duration: 300, animation: 'slash'
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('expanding-force', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'bgColor', color: '#4b0082', duration: 800 },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 5, duration: 800, speed: 100 },
            {
                type: 'formation', target: 'defender', pattern: 'ring',
                shape: 'spiral', particleSize: 20, color: '#9370db', outline: '#4b0082',
                duration: 800, stagger: 20
            }
        ]
    }
]);

AnimFramework.register('shadow-sneak', [
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.opacity = '0'; // Vanish
        }
    },
    { type: 'sfx', sound: 'ghost' },
    { type: 'wait', ms: 300 },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#4b0082', outline: '#000', width: 30, height: 30,
                duration: 200, animation: 'slam'
            },
            { type: 'spriteShake', target: 'defender', duration: 200 }
        ]
    },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.opacity = '1'; // Reappear
        }
    }
]);

AnimFramework.register('poltergeist', [
    { type: 'sfx', sound: 'ghost' },
    { type: 'bgColor', color: '#2f4f4f', duration: 800 },
    {
        type: 'formation', target: 'defender', pattern: 'ring', // Items swirling?
        shape: 'rock', particleSize: 15, color: '#purple', outline: '#000', // Abstract items
        duration: 800, stagger: 100
    },
    { type: 'spriteShake', target: 'defender', duration: 600 }
]);

AnimFramework.register('astonish', [
    { type: 'sfx', sound: 'ghost' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 100 },
    { type: 'spriteShake', target: 'defender', duration: 200 }
]);

AnimFramework.register('shadow-punch', [
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'overlay', target: 'defender', shape: 'fist',
        color: '#4b0082', outline: '#000000', width: 40, height: 40,
        duration: 300, animation: 'slam'
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('dazzling-gleam', [
    { type: 'sfx', sound: 'charge' },
    { type: 'flash', color: '#ffb6c1', duration: 600, opacity: 0.8 },
    {
        type: 'formation', target: 'defender', pattern: 'ring',
        shape: 'star', particleSize: 15, color: '#fff0f5', outline: '#ff69b4',
        duration: 500, stagger: 20
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('draining-kiss', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'heal' },
    {
        type: 'overlay', target: 'defender', shape: 'heart',
        color: '#ff69b4', outline: '#c71585', width: 30, height: 30,
        duration: 400, animation: 'grow'
    },
    { type: 'wait', ms: 200 },
    { type: 'flash', color: '#ffb6c1', duration: 300, opacity: 0.4 } // Heal
]);

AnimFramework.register('fairy-wind', [
    { type: 'sfx', sound: 'flying' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 20, interval: 30, spread: 40, travelTime: 500,
        size: 5, color: '#ffb6c1', outline: '#ff69b4'
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('dark-void', [
    { type: 'sfx', sound: 'dark' },
    { type: 'bgColor', color: '#000000', duration: 1500 },
    {
        type: 'overlay', target: 'defender', shape: 'zzz',
        color: '#800080', outline: '#4b0082', width: 30, height: 30,
        duration: 1000, animation: 'float', count: 5, spread: 30
    }
]);

AnimFramework.register('night-daze', [
    { type: 'sfx', sound: 'dark' },
    { type: 'bgColor', color: '#C71585', duration: 800 }, // Mangenta-ish
    { type: 'wave', intensity: 5, duration: 800, speed: 100 },
    { type: 'spriteShake', target: 'defender', duration: 600 }
]);


AnimFramework.register('foul-play', [
    { type: 'sfx', sound: 'dark' },
    {
        type: 'parallel', steps: [
            { type: 'invert', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#000', outline: '#fff', width: 40, height: 40,
                duration: 300, animation: 'slam'
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('dragon-rush', [
    { type: 'sfx', sound: 'dragon' },
    { type: 'bgColor', color: '#4169e1', duration: 500 },
    { type: 'spriteMove', target: 'attacker', preset: 'charge' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-dragon', duration: 600 },
            { type: 'spriteShake', target: 'defender', duration: 500 }
        ]
    },
    { type: 'spriteMove', target: 'attacker', preset: 'recoil' }
]);

AnimFramework.register('dragon-breath', [
    { type: 'sfx', sound: 'dragon' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 20, interval: 25, spread: 30, travelTime: 400,
        size: 7, color: '#3cb371', outline: '#2e8b57' // Greenish
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-dragon', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('dragon-dance', [
    { type: 'sfx', sound: 'dragon' },
    { type: 'spriteMove', target: 'attacker', preset: 'jump', duration: 300 },
    {
        type: 'formation', target: 'attacker', pattern: 'ring',
        shape: 'sparkle', particleSize: 15, color: '#ff4500', outline: '#000000',
        duration: 800, stagger: 50
    }
]);

AnimFramework.register('calm-mind', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'spriteWave', target: 'attacker', intensity: 3, duration: 800, speed: 60 },
    {
        type: 'overlay', target: 'attacker', shape: 'spiral',
        color: '#ff69b4', outline: '#ffffff', width: 60, height: 60,
        duration: 800, animation: 'grow'
    }
]);

AnimFramework.register('nasty-plot', [
    { type: 'sfx', sound: 'dark' },
    { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 400 },
    {
        type: 'formation', target: 'attacker', pattern: 'ring',
        shape: 'skull', particleSize: 18, color: '#000000', outline: '#800080',
        duration: 800, stagger: 50
    }
]);

AnimFramework.register('agility', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'spriteMove', target: 'attacker', preset: 'dodge', duration: 150 },
    { type: 'spriteGhost', target: 'attacker', color: '#ffffff', hold: 50, duration: 300 },
    { type: 'wait', ms: 100 },
    { type: 'spriteMove', target: 'attacker', preset: 'dodge', duration: 150 },
    { type: 'spriteGhost', target: 'attacker', color: '#ffffff', hold: 50, duration: 300 }
]);
