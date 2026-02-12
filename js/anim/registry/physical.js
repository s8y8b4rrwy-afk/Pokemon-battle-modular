/** @type {AnimationEngine} */

AnimFramework.register('tackle', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteShake', target: 'defender', duration: 200 }
]);

AnimFramework.register('scratch', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'normal' },
    {
        type: 'overlay', target: 'defender', shape: 'claw',
        color: '#fff', outline: '#000', width: 24, height: 24,
        duration: 200, animation: 'strike'
    },
    { type: 'spriteShake', target: 'defender', duration: 200 }
]);

AnimFramework.register('pound', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'normal' },
    {
        type: 'overlay', target: 'defender', shape: 'fist',
        color: '#fff', outline: '#000', width: 20, height: 20,
        duration: 200, animation: 'slam'
    },
    { type: 'spriteShake', target: 'defender', duration: 200 }
]);

AnimFramework.register('leech-life', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'bug' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'claw', // Fang-like
                color: '#a8b820', outline: '#556b2f', width: 24, height: 24,
                duration: 300, animation: 'strike'
            },
            { type: 'spriteShake', target: 'defender', duration: 300 }
        ]
    },
    { type: 'sfx', sound: 'heal' },
    { type: 'flash', color: '#fff', duration: 300, opacity: 0.3 }
]);

AnimFramework.register('twin-needle', [
    { type: 'sfx', sound: 'bug' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 2, interval: 150, travelTime: 250,
        projectile: {
            width: 8, height: 4,
            styles: { background: '#a8b820', borderRadius: '50% 0', border: '1px solid #000' }
        }
    },
    { type: 'spriteShake', target: 'defender', duration: 200 }
]);

AnimFramework.register('fury-cutter', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'bug' },
    {
        type: 'overlay', target: 'defender', shape: 'claw',
        color: '#c03028', outline: '#800000', width: 30, height: 30,
        duration: 200, animation: 'strike'
    },
    { type: 'spriteShake', target: 'defender', duration: 200 }
]);

AnimFramework.register('karate-chop', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'fighting' },
    {
        type: 'overlay', target: 'defender', shape: 'claw', // Hand chop
        color: '#fff', outline: '#000', width: 24, height: 40,
        duration: 200, animation: 'slam'
    },
    { type: 'spriteShake', target: 'defender', duration: 200 }
]);

AnimFramework.register('submission', [
    { type: 'spriteMove', target: 'attacker', preset: 'slam' },
    { type: 'sfx', sound: 'fighting' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-fighting', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 },
            { type: 'tilt', angle: 5, duration: 300 }
        ]
    },
    { type: 'spriteMove', target: 'attacker', preset: 'recoil' }
]);

AnimFramework.register('pin-missile', [
    { type: 'sfx', sound: 'bug' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 5, interval: 100, travelTime: 300,
        projectile: {
            width: 12, height: 4,
            styles: { background: '#a8b820', borderRadius: '50% 0', border: '1px solid #000' }
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-bug', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 300 }
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

AnimFramework.register('crabhammer', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'water' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#ff4500', outline: '#000', width: 32, height: 32,
                duration: 300, animation: 'slam'
            },
            { type: 'screenFx', class: 'fx-water', duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
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
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('giga-impact', [
    { type: 'sfx', sound: 'normal' },
    { type: 'bgColor', color: '#808080', duration: 500 },
    { type: 'spriteMove', target: 'attacker', preset: 'charge', duration: 300 },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-normal', duration: 800 },
            { type: 'tilt', angle: 8, duration: 250 },
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#fff', outline: '#000', width: 80, height: 80,
                duration: 400, animation: 'slam'
            },
            { type: 'sfx', sound: 'damage' } // Heavy hit
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 600 },
    { type: 'spriteMove', target: 'attacker', preset: 'recoil', duration: 400 } // Recharge feel
]);

AnimFramework.register('superpower', [
    { type: 'sfx', sound: 'fighting' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ff4500', duration: 400, opacity: 0.6 },
            { type: 'spriteShake', target: 'attacker', duration: 300 } // Charging up
        ]
    },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 200 },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'fist', color: '#b22222', width: 60, height: 60, duration: 400, animation: 'slam' },
            { type: 'tilt', angle: 5, duration: 300 }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 500 }
]);

AnimFramework.register('fly', [
    // 1. Position in Sky (Hidden initially to avoid flicker if Opacity is 1)
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transition = 'none';
            sprite.style.transform = 'translateY(-250px)';
            sprite.style.opacity = '1';
        }
    },
    { type: 'wait', ms: 400 }, // Suspense
    { type: 'sfx', sound: 'flying' },
    {
        type: 'parallel', steps: [
            // 2. Slam Down
            {
                type: 'callback', fn: ctx => {
                    const sprite = ctx.attackerSprite;
                    sprite.style.transition = 'transform 0.2s ease-in';
                    sprite.style.transform = 'translateY(0)';
                }
            },
            {
                type: 'overlay', target: 'defender', shape: 'bird',
                color: '#fff', outline: '#87ceeb', width: 50, height: 30,
                duration: 300, animation: 'strike'
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 300 },
    { type: 'wait', ms: 200 },
    { type: 'callback', fn: ctx => { ctx.attackerSprite.style.transition = ''; ctx.attackerSprite.style.transform = ''; } }
]);

AnimFramework.register('bounce', [
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transition = 'none';
            sprite.style.transform = 'translateY(-250px)';
            sprite.style.opacity = '1';
        }
    },
    { type: 'wait', ms: 400 },
    { type: 'sfx', sound: 'flying' },
    {
        type: 'parallel', steps: [
            {
                type: 'callback', fn: ctx => {
                    const sprite = ctx.attackerSprite;
                    sprite.style.transition = 'transform 0.2s ease-in';
                    sprite.style.transform = 'translateY(0)';
                }
            },
            { type: 'spriteShake', target: 'defender', duration: 300 }
        ]
    },
    { type: 'callback', fn: ctx => { ctx.attackerSprite.style.transition = ''; ctx.attackerSprite.style.transform = ''; } }
]);

AnimFramework.register('brave-bird', [
    { type: 'sfx', sound: 'flying' },
    { type: 'bgColor', color: '#87ceeb', duration: 400 },
    { type: 'spriteMove', target: 'attacker', preset: 'charge', duration: 250 },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-flying', duration: 600 },
            { type: 'flash', color: '#00bfff', duration: 300, opacity: 0.5 },
            {
                type: 'overlay', target: 'defender', shape: 'bird',
                color: '#fff', outline: '#00008b', width: 60, height: 40,
                duration: 400, animation: 'slam'
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 500 },
    { type: 'spriteMove', target: 'attacker', preset: 'recoil' }
]);

AnimFramework.register('sludge-wave', [
    { type: 'sfx', sound: 'poison' },
    { type: 'wave', intensity: 4, duration: 1000, speed: 100 },
    {
        type: 'stream', from: { x: -20, y: 100 }, to: { x: 340, y: 100 },
        count: 20, interval: 30, spread: 200, travelTime: 800,
        size: 5, color: '#a040a0', outline: '#4b0082'
    },
    { type: 'spriteShake', target: 'defender', duration: 800 }
]);

AnimFramework.register('rage', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'parallel', steps: [
            { type: 'spriteMove', target: 'attacker', preset: 'tackle' }, // rapid hits
            { type: 'filter', target: 'attacker', filter: 'sepia(1) hue-rotate(-50deg) saturate(2)', duration: 400 },
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#ff4500', outline: '#8b0000', width: 30, height: 30,
                duration: 300, animation: 'strike', count: 2, spread: 20
            }
        ]
    }
]);

AnimFramework.register('thrash', [
    { type: 'sfx', sound: 'fighting' },
    {
        type: 'parallel', steps: [
            // Wild movement
            { type: 'spriteMove', target: 'attacker', preset: 'lunge', px: 30, py: -20, duration: 200 },
            { type: 'filter', target: 'attacker', filter: 'sepia(1) hue-rotate(-50deg) saturate(2)', duration: 600 },
            {
                type: 'overlay', target: 'defender', shape: 'claw',
                color: '#b22222', outline: '#800000', width: 40, height: 40,
                duration: 600, animation: 'slam', count: 3, spread: 40, stagger: 100
            }
        ]
    },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', px: -30, py: 20, duration: 200 }, // Thrash back
    { type: 'wait', ms: 200 },
    { type: 'spriteMove', target: 'attacker', preset: 'tackle', duration: 300 } // Final hit
]);
