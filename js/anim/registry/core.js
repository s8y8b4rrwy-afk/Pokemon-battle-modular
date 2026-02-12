/** @type {AnimationEngine} */

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

// --- TYPE-BASED SCREEN FX ---

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
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'normal' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-normal', duration: 300 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'claw',
                color: '#fff', outline: '#000',
                width: 24, height: 24, duration: 250, animation: 'grow'
            },
            {
                type: 'particles', position: 'defender', count: 6, spread: 25, duration: 400,
                particleStyles: { background: '#fff', border: '1px solid #000' }
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
    {
        type: 'parallel', steps: [
            { type: 'cssClass', el: 'defender', class: 'status-anim-brn', duration: 600 },
            {
                type: 'particles', position: 'defender', count: 6, spread: 20, duration: 600,
                particleStyles: { background: '#ff4500', borderRadius: '50% 50% 0 50%' }
            }
        ]
    }
]);

AnimFramework.register('status-par', [
    { type: 'sfx', sound: 'electric' },
    {
        type: 'parallel', steps: [
            { type: 'cssClass', el: 'defender', class: 'status-anim-par', duration: 600 },
            {
                type: 'overlay', target: 'defender', shape: 'lightning',
                color: '#ffd700', outline: '#b8860b',
                width: 20, height: 40, duration: 400, animation: 'strike',
                count: 2, spread: 15
            },
            { type: 'spriteShake', target: 'defender', duration: 400 } // Jitter
        ]
    }
]);

AnimFramework.register('status-psn', [
    { type: 'sfx', sound: 'poison' },
    {
        type: 'parallel', steps: [
            { type: 'cssClass', el: 'defender', class: 'status-anim-psn', duration: 600 },
            {
                type: 'overlay', target: 'defender', shape: 'bubble',
                color: '#a040a0', outline: '#4b0082', width: 12, height: 12,
                duration: 600, animation: 'float', count: 4, spread: 25
            }
        ]
    }
]);

AnimFramework.register('status-frz', [
    { type: 'sfx', sound: 'ice' },
    {
        type: 'parallel', steps: [
            { type: 'cssClass', el: 'defender', class: 'status-anim-frz', duration: 600 },
            { type: 'filter', target: 'defender', filter: 'brightness(1.5) hue-rotate(180deg)', duration: 600 },
            {
                type: 'particles', position: 'defender', count: 8, spread: 20, duration: 600,
                particleStyles: { background: '#e0ffff', boxShadow: '0 0 5px #fff' }
            }
        ]
    }
]);

AnimFramework.register('status-slp', [
    { type: 'sfx', sound: 'psychic' }, // Soft sound
    {
        type: 'parallel', steps: [
            { type: 'cssClass', el: 'defender', class: 'status-anim-slp', duration: 800 },
            {
                type: 'overlay', target: 'defender', shape: 'zzz',
                color: '#fff', outline: '#000', width: 24, height: 18,
                duration: 800, animation: 'float', count: 3, spread: 10, stagger: 200
            }
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

// --- ADDITIONAL STATUS MOVES ---

AnimFramework.register('growl', (ctx) => {
    const steps = [
        // Attempt to play cry if available in context
        {
            type: 'callback', fn: ctx => {
                if (ctx.attacker && ctx.attacker.cry) AudioEngine.playCry(ctx.attacker.cry);
            }
        },
        { type: 'sfx', sound: 'normal' },
        {
            type: 'parallel', steps: [
                { type: 'wave', intensity: 2, duration: 600, speed: 150 },
                {
                    type: 'overlay', target: 'defender', shape: 'spiral', // visual "sound waves"
                    color: '#fff', outline: '#000', width: 60, height: 60,
                    duration: 600, animation: 'grow'
                }
            ]
        },
        { type: 'wait', ms: 200 }
    ];
    return steps;
});

AnimFramework.register('protect', [
    { type: 'sfx', sound: 'steel' },
    {
        type: 'overlay', target: 'attacker', shape: 'shield',
        color: '#87cefa', outline: '#4682b4', width: 60, height: 60,
        duration: 800, animation: 'contain'
    },
    { type: 'wait', ms: 200 }
]);

AnimFramework.register('detect', [
    { type: 'sfx', sound: 'fighting' },
    { type: 'flash', color: '#fff', duration: 150, opacity: 0.5 },
    { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 200 }, // Dodge movement
    {
        type: 'overlay', target: 'attacker', shape: 'eye',
        color: '#ff8c00', outline: '#8b0000', width: 50, height: 30,
        duration: 500, animation: 'fade'
    }
]);

AnimFramework.register('endure', [
    { type: 'sfx', sound: 'fighting' },
    { type: 'filter', target: 'attacker', filter: 'brightness(1.2) sepia(0.5)', duration: 600 },
    { type: 'wait', ms: 300 }
]);

AnimFramework.register('splash', [
    { type: 'sfx', sound: 'water' }, // Or generic hop sound?
    { type: 'spriteMove', target: 'attacker', preset: 'jump', duration: 300 },
    { type: 'wait', ms: 200 },
    { type: 'callback', fn: async () => await UI.typeText("But nothing happened!") }
]);

AnimFramework.register('transform', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'filter', target: 'attacker', filter: 'brightness(0) invert(1)', duration: 300 }, // Flash white
    { type: 'wait', ms: 300 },
    { type: 'filter', target: 'attacker', filter: '', duration: 100 }
]);

AnimFramework.register('substitute', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.opacity = '0.5'; // Fade out slightly before swap (handled by engine)
        }
    },
    {
        type: 'particles', position: 'attacker', count: 15, spread: 40, duration: 600,
        particleStyles: { background: '#fff', borderRadius: '50%' } // Poof effect
    },
    { type: 'wait', ms: 300 }
]);

AnimFramework.register('metronome', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'parallel', steps: [
            { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 400 },
            {
                type: 'formation', target: 'attacker', pattern: 'ring',
                shape: 'sparkle', particleSize: 10, color: '#fff', outline: '#000',
                duration: 600, stagger: 50
            }
        ]
    },
    { type: 'wait', ms: 400 }
]);

AnimFramework.register('reflect', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'overlay', target: 'attacker', shape: 'wall',
        color: '#ff69b4', outline: '#c71585', width: 60, height: 60,
        duration: 1000, animation: 'contain'
    },
    { type: 'wait', ms: 300 }
]);

AnimFramework.register('light-screen', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'overlay', target: 'attacker', shape: 'wall',
        color: '#ffff00', outline: '#ffd700', width: 60, height: 60,
        duration: 1000, animation: 'contain'
    },
    { type: 'wait', ms: 300 }
]);

AnimFramework.register('safeguard', [
    { type: 'sfx', sound: 'heal' },
    {
        type: 'overlay', target: 'attacker', shape: 'shield',
        color: '#98fb98', outline: '#228b22', width: 60, height: 60,
        duration: 1000, animation: 'fade' // Green shield
    }
]);

AnimFramework.register('mist', [
    { type: 'sfx', sound: 'ice' },
    { type: 'screenFx', class: 'fx-ice', duration: 800 }, // icy fog
    {
        type: 'particles', position: 'scene', count: 25, spread: 150, duration: 1200,
        particleStyles: { background: '#e0ffff', opacity: 0.5, borderRadius: '50%' }
    }
]);

AnimFramework.register('screech', (ctx) => {
    return [
        {
            type: 'callback', fn: ctx => {
                if (ctx.attacker && ctx.attacker.cry) AudioEngine.playCry(ctx.attacker.cry);
            }
        },
        { type: 'sfx', sound: 'normal' },
        {
            type: 'parallel', steps: [
                { type: 'wave', intensity: 5, duration: 800, speed: 200 }, // Intense shaking
                {
                    type: 'overlay', target: 'defender', shape: 'spiral',
                    color: '#8b008b', outline: '#000', width: 80, height: 80,
                    duration: 800, animation: 'grow', count: 3, spread: 20
                }
            ]
        }
    ];
});

AnimFramework.register('sing', [
    { type: 'sfx', sound: 'psychic' }, // Melodic placeholder
    {
        type: 'formation', target: 'scene', pattern: 'ring',
        shape: 'music', // TODO: Add music note shape if possible, defaulting to spiral
        particleSize: 15, color: '#ffb6c1', outline: '#ff69b4',
        duration: 1500, stagger: 60
    },
    { type: 'wait', ms: 500 }
]);

AnimFramework.register('glare', [
    { type: 'sfx', sound: 'ghost' },
    { type: 'invert', target: 'defender', duration: 200 }, // Flash negate
    {
        type: 'overlay', target: 'defender', shape: 'eye', // TODO: Add eye shape, fallback to generic
        color: '#ffd700', outline: '#b22222', width: 60, height: 40,
        duration: 800, animation: 'contain'
    },
    { type: 'wait', ms: 300 }
]);

AnimFramework.register('toxic-spikes', [
    { type: 'sfx', sound: 'poison' },
    {
        type: 'formation', target: 'defender', pattern: 'xShape',
        shape: 'skull', particleSize: 12, color: '#a040a0', outline: '#4b0082', // Purple skulls
        duration: 800, stagger: 30
    }
]);

AnimFramework.register('taunt', [
    { type: 'sfx', sound: 'dark' },
    {
        type: 'overlay', target: 'defender', shape: 'eye', // Or angry face if avail
        color: '#ff0000', outline: '#000', width: 50, height: 30,
        duration: 600, animation: 'shake'
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('encore', [
    { type: 'sfx', sound: 'normal' }, // Clapping sound?
    {
        type: 'overlay', target: 'defender', shape: 'music',
        color: '#ffd700', outline: '#ffa500', width: 30, height: 30,
        duration: 800, animation: 'float', count: 3, stagger: 100
    }
]);

AnimFramework.register('disable', [
    { type: 'sfx', sound: 'psychic' },
    { type: 'flash', color: '#a9a9a9', duration: 400, opacity: 0.5 },
    { type: 'filter', target: 'defender', filter: 'grayscale(1)', duration: 600 },
    {
        type: 'overlay', target: 'defender', shape: 'xShape', // TODO: Add X shape or use generic
        color: '#000', outline: '#fff', width: 60, height: 60,
        duration: 600, animation: 'contain', count: 1
    }
]);

AnimFramework.register('mean-look', [
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'overlay', target: 'defender', shape: 'eye',
        color: '#000', outline: '#fff', width: 80, height: 50,
        duration: 1000, animation: 'contain'
    }
]);

AnimFramework.register('spite', [
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'overlay', target: 'defender', shape: 'spiral',
        color: '#4b0082', outline: '#000', width: 40, height: 40,
        duration: 600, animation: 'fade' // Draining PP
    }
]);

AnimFramework.register('pain-split', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 600, // Connection
        width: 8, height: 4, beamStyles: { background: '#fff', opacity: 0.5 }
    },
    { type: 'wait', ms: 200 },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#fff', duration: 200, opacity: 0.5 },
            { type: 'sfx', sound: 'heal' }
        ]
    }
]);

AnimFramework.register('sweet-scent', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'parallel', steps: [
            { type: 'bgColor', color: '#ffc0cb', duration: 800 },
            {
                type: 'particles', position: 'scene', count: 20, spread: 100, duration: 1000,
                particleStyles: { background: '#ff69b4', borderRadius: '50%' }
            }
        ]
    }
]);

AnimFramework.register('attract', [
    { type: 'sfx', sound: 'heal' },
    {
        type: 'formation', target: 'defender', pattern: 'heart', // Custom pattern needed? Or just ring
        shape: 'heart', // Needs heart shape
        particleSize: 20, color: '#ff69b4', outline: '#ff1493',
        duration: 1000, stagger: 50
    },
    { type: 'wait', ms: 300 }
]);

AnimFramework.register('charm', [
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteMove', target: 'attacker', preset: 'jump', duration: 300 },
    {
        type: 'particles', position: 'defender', count: 15, spread: 40, duration: 800,
        particleStyles: { background: '#ffb6c1' }
    }
]);

AnimFramework.register('yawn', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'overlay', target: 'defender', shape: 'bubble', // Sleep bubble
        color: '#e0ffff', outline: '#87cefa', width: 40, height: 40,
        duration: 1000, animation: 'float'
    }
]);

AnimFramework.register('tail-whip', [
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 400 },
    { type: 'wait', ms: 200 }
]);

AnimFramework.register('leer', [
    { type: 'sfx', sound: 'normal' },
    { type: 'flash', color: '#ff0000', duration: 200, opacity: 0.3 },
    {
        type: 'beam', from: 'attacker', to: 'defender', duration: 400,
        width: 10, height: 2, beamStyles: { background: '#ff0000', boxShadow: '0 0 5px red' }
    },
    { type: 'wait', ms: 200 }
]);

AnimFramework.register('sand-attack', [
    { type: 'sfx', sound: 'ground' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 15, interval: 30, spread: 25, travelTime: 400,
        size: 4, color: '#d2b48c', outline: '#8b4513'
    },
    { type: 'wait', ms: 200 }
]);

AnimFramework.register('smokescreen', [
    { type: 'sfx', sound: 'poison' }, // Close enough to smoke sound
    {
        type: 'particles', position: 'defender', count: 20, spread: 60, duration: 800,
        particleStyles: { background: '#808080', opacity: 0.8, borderRadius: '50%' }
    },
    { type: 'wait', ms: 300 }
]);

AnimFramework.register('double-team', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'parallel', steps: [
            { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 300 },
            { type: 'flash', color: '#fff', duration: 300, opacity: 0.4 }
        ]
    }
]);

AnimFramework.register('harden', [
    { type: 'sfx', sound: 'steel' },
    { type: 'filter', target: 'attacker', filter: 'brightness(1.5) contrast(1.2)', duration: 500 },
    { type: 'wait', ms: 200 }
]);

AnimFramework.register('minimize', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transition = 'transform 0.5s ease-in-out';
            sprite.style.transform = 'scale(0.5)';
        }
    },
    { type: 'wait', ms: 600 },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transform = 'scale(1)';
        }
    }
]);

// --- WEATHER & VOLATILE TICKS ---

AnimFramework.register('weather-sandstorm', [
    { type: 'sfx', sound: 'ground' },
    { type: 'bgColor', color: '#f4a460', duration: 400 },
    {
        type: 'stream', from: { x: -20, y: 100 }, to: { x: 340, y: 100 },
        count: 10, interval: 40, spread: 200, travelTime: 400,
        size: 3, color: '#d2b48c', outline: '#8b4513'
    }
]);

AnimFramework.register('weather-hail', [
    { type: 'sfx', sound: 'ice' },
    { type: 'bgColor', color: '#f0f8ff', duration: 400 },
    {
        type: 'stream', from: { x: 0, y: -20 }, to: { x: 50, y: 300 },
        count: 8, interval: 40, spread: 340, travelTime: 400,
        size: 4, color: '#e0ffff', outline: '#b0e0e6'
    }
]);

AnimFramework.register('weather-rain', [
    { type: 'sfx', sound: 'water' },
    { type: 'bgColor', color: '#000033', duration: 400 },
    {
        type: 'stream', from: { x: 0, y: -20 }, to: { x: 0, y: 300 },
        count: 15, interval: 30, spread: 340, travelTime: 400,
        size: 2, color: '#87cefa', outline: '#4682b4'
    }
]);

AnimFramework.register('weather-sun', [
    { type: 'sfx', sound: 'fire' },
    { type: 'flash', color: '#fffacd', duration: 400, opacity: 0.3 },
    { type: 'bgColor', color: '#fa8072', duration: 400 }
]);

AnimFramework.register('tick-leech-seed', [
    { type: 'sfx', sound: 'grass' },
    {
        type: 'overlay', target: 'defender', shape: 'leaf',
        color: '#32cd32', outline: '#006400', width: 20, height: 20,
        duration: 400, animation: 'fade' // Draining life
    }
]);

AnimFramework.register('tick-curse', [
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'overlay', target: 'defender', shape: 'skull',
        color: '#4b0082', outline: '#000', width: 24, height: 24,
        duration: 400, animation: 'fade'
    }
]);

AnimFramework.register('tick-nightmare', [
    { type: 'sfx', sound: 'ghost' },
    {
        type: 'overlay', target: 'defender', shape: 'zzz',
        color: '#8b0000', outline: '#000', width: 20, height: 20,
        duration: 400, animation: 'float'
    }
]);
