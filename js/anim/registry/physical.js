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
        duration: 250, animation: 'slash', count: 3, spread: 15, stagger: 100
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
                type: 'overlay', target: 'defender',
                color: '#a8b820', outline: '#556b2f', width: 30, height: 30,
                duration: 300, animation: 'crunch', count: 2, stagger: 0
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
        duration: 250, animation: 'slash', count: 4, spread: 25, stagger: 100
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
    {
        type: 'parallel', steps: [
            { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 150 },
            { type: 'spriteGhost', target: 'attacker', color: '#ffffff', duration: 400 }
        ]
    },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'claw', color: '#ffffff', width: 24, height: 24, duration: 200, animation: 'slash' },
            { type: 'spriteShake', target: 'defender', duration: 200 }
        ]
    }
]);

AnimFramework.register('extreme-speed', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'parallel', steps: [
            { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 80 },
            { type: 'spriteGhost', target: 'attacker', color: '#ffffff', duration: 300, hold: 50 },
            { type: 'flash', color: '#ffffff', duration: 200, opacity: 0.3 }
        ]
    },
    {
        type: 'parallel', steps: [
            { type: 'overlay', target: 'defender', shape: 'claw', color: '#ffffff', width: 40, height: 40, duration: 200, animation: 'slash' },
            { type: 'spriteShake', target: 'defender', duration: 300 }
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
        type: "wave",
        ms: 200,
        class: "fx-flash",
        duration: 500,
        color: "#ffffff",
        opacity: 0.8,
        from: "attacker",
        to: "defender",
        className: "beam-projectile",
        width: 6,
        height: 6,
        beamStyles: "",
        selector: "#attacker",
        x: 0,
        y: 0,
        easing: "ease-out",
        reset: true,
        cry: "",
        target: "attacker",
        wait: 0,
        sound: "faint",
        parent: "fxContainer",
        tag: "div",
        text: "",
        intensity: 2,
        speed: 10
    },
    {
        type: "parallel",
        steps: [
            {
                type: "sfx",
                sound: "fighting"
            },
            {
                type: "spriteMove",
                target: "attacker",
                preset: "lunge"
            }
        ]
    },
    {
        type: "parallel",
        steps: [
            {
                type: "tilt",
                target: "defender",
                shape: "fist",
                color: "#ff0000",
                width: 30,
                height: 30,
                duration: 200,
                animation: "slam",
                count: 3,
                spread: 20,
                angle: 15
            },
            {
                type: "spriteShake",
                target: "defender",
                duration: 200
            }
        ]
    },
    {
        type: "parallel",
        steps: [
            {
                type: "sfx",
                sound: "fighting"
            },
            {
                type: "spriteMove",
                target: "defender",
                preset: "dodge",
                duration: 100
            }
        ]
    },
    {
        type: "parallel",
        steps: [
            {
                type: "sfx",
                sound: "fighting",
                wait: 10
            },
            {
                type: "spriteMove",
                target: "defender",
                preset: "dodge",
                duration: 100
            }
        ]
    },
    {
        type: "parallel",
        steps: [
            {
                type: "sfx",
                sound: "fighting"
            },
            {
                type: "spriteMove",
                target: "defender",
                preset: "dodge",
                duration: 100
            }
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
            { type: 'spriteWave', target: 'defender', intensity: 12, duration: 800, speed: 60 },
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
            { type: 'overlay', target: 'defender', shape: 'gust', color: '#ffffff', width: 50, height: 70, duration: 300, animation: 'slash' },
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
            { type: 'formation', target: 'defender', pattern: 'ring', shape: 'gust', particleSize: 20, color: '#add8e6', duration: 1000, stagger: 30 }
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
            { type: 'overlay', target: 'defender', shape: 'gust', color: '#ffffff', outline: '#000000', width: 40, height: 50, duration: 200, animation: 'slash', count: 2, spread: 15 }
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
    { type: 'bgColor', color: '#d85b2aff', duration: 500 },
    { type: 'spriteMove', target: 'attacker', preset: 'charge', duration: 100 },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-normal', duration: 800 },
            { type: 'tilt', angle: 8, duration: 250 },
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#fff', outline: '#000', width: 40, height: 40,
                duration: 700, animation: 'slam'
            },
            { type: 'sfx', sound: 'damage' } // Heavy hit
        ]
    }
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

AnimFramework.register('snore', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 3, interval: 300, spread: 20, travelTime: 600,
        size: 20, color: '#87ceeb', outline: '#000080', svgShape: 'zzz'
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('yawn', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'attacker', shape: 'bubble',
                color: '#ffffff', outline: '#a9a9a9', width: 40, height: 40,
                duration: 600, animation: 'grow'
            },
            { type: 'wave', intensity: 2, duration: 1000, speed: 50 },
            {
                type: 'overlay', target: 'defender', shape: 'zzz',
                color: '#ffffff', outline: '#000000', width: 30, height: 30,
                duration: 800, animation: 'float'
            }
        ]
    }
]);

AnimFramework.register('sleep-talk', [
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteShake', target: 'attacker', duration: 300 },
    {
        type: 'overlay', target: 'attacker', shape: 'bubble',
        color: '#ffffff', outline: '#000000', width: 30, height: 20,
        duration: 400, animation: 'fade'
    }
]);

// --- NEW PHYSICAL / NORMAL ANIMATIONS ---

AnimFramework.register('fake-out', [
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 100 },
    {
        type: 'overlay', target: 'defender', shape: 'star',
        color: '#ffffff', outline: '#000000', width: 40, height: 40,
        duration: 200, animation: 'slam'
    },
    { type: 'spriteShake', target: 'defender', duration: 200 }
]);

AnimFramework.register('facade', [
    { type: 'sfx', sound: 'normal' },
    { type: 'flash', color: '#ff4500', duration: 300, opacity: 0.4 }, // Guts flame
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    {
        type: 'overlay', target: 'defender', shape: 'fist',
        color: '#fff', outline: '#000', width: 50, height: 50,
        duration: 300, animation: 'slam'
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('acrobatics', [
    { type: 'sfx', sound: 'flying' },
    { type: 'spriteMove', target: 'attacker', preset: 'jump', duration: 200 },
    { type: 'wait', ms: 100 },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', x: 50, y: -50, duration: 200 }, // Aerial strike
    {
        type: 'overlay', target: 'defender', shape: 'bird',
        color: '#87ceeb', outline: '#000', width: 40, height: 40,
        duration: 300, animation: 'strike'
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('gunk-shot', [
    { type: 'sfx', sound: 'poison' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 1, interval: 0, travelTime: 400,
        projectile: {
            width: 30, height: 30, // Big trash can/blob
            styles: { background: '#4b0082', borderRadius: '10px', border: '2px solid #000' }
        }
    },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-poison', duration: 600 },
            { type: 'particles', position: 'defender', count: 12, spread: 40, duration: 600, particleStyles: { background: '#800080' } }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 500 }
]);

AnimFramework.register('high-jump-kick', [
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transform = 'translateY(-300px)'; // Jump high
            sprite.style.transition = 'transform 0.4s ease-out';
        }
    },
    { type: 'wait', ms: 400 },
    { type: 'sfx', sound: 'fighting' },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transform = 'translateY(0)'; // Crash down
            sprite.style.transition = 'transform 0.2s ease-in';
        }
    },
    { type: 'wait', ms: 150 },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'kick',
                color: '#b22222', outline: '#000', width: 50, height: 50,
                duration: 300, animation: 'slam'
            },
            { type: 'tilt', angle: 6, duration: 300 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('body-press', [
    { type: 'sfx', sound: 'fighting' },
    { type: 'spriteMove', target: 'attacker', preset: 'slam' },
    {
        type: 'parallel', steps: [
            { type: 'screenFx', class: 'fx-fighting', duration: 600 },
            { type: 'tilt', angle: 8, duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 500 }
        ]
    }
]);

AnimFramework.register('hyper-voice', [
    { type: 'sfx', sound: 'normal' }, // Should be loud
    {
        type: 'formation', target: 'attacker', pattern: 'ring',
        shape: 'music', particleSize: 15, color: '#000', outline: '#fff',
        duration: 800, stagger: 40
    },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 5, duration: 800, speed: 150 },
            { type: 'spriteShake', target: 'defender', duration: 600 }
        ]
    }
]);

AnimFramework.register('boomburst', [
    { type: 'sfx', sound: 'explosion' },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 10, duration: 1000, speed: 200 },
            { type: 'flash', color: '#fff', duration: 200, opacity: 0.6 },
            { type: 'screenFx', class: 'fx-normal', duration: 800 }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 800 }
]);

AnimFramework.register('swift', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 3, interval: 50, travelTime: 300,
        projectile: {
            width: 15, height: 15, // Star shape ideally, but block for now or rotate
            styles: { background: '#ffd700', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }
        }
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('focus-energy', [
    { type: 'sfx', sound: 'charge' },
    { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 600 },
    { type: 'flash', color: '#ff4500', duration: 400, opacity: 0.4 },
    {
        type: 'formation', target: 'attacker', pattern: 'rise',
        shape: 'fist', particleSize: 12, color: '#ff4500', outline: '#000',
        duration: 800, stagger: 50
    }
]);

AnimFramework.register('minimize', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transform = 'scale(0.5)';
            sprite.style.transition = 'transform 0.4s';
        }
    },
    { type: 'wait', ms: 500 },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            // Effect persists purely visually until reset
            setTimeout(() => { sprite.style.transform = ''; }, 1000); // Temporary visual
        }
    }
]);

AnimFramework.register('smoke-screen', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'particles', position: 'defender', count: 20, spread: 60, duration: 1000,
        particleStyles: { background: '#696969', opacity: 0.8, borderRadius: '50%' }
    },
    { type: 'wait', ms: 500 }
]);

AnimFramework.register('sweet-kiss', [
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 300 },
    {
        type: 'overlay', target: 'defender', shape: 'heart',
        color: '#ff69b4', outline: '#ffc0cb', width: 30, height: 30,
        duration: 400, animation: 'grow'
    }
]);

AnimFramework.register('lovely-kiss', [
    { type: 'sfx', sound: 'normal' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', duration: 300 },
    {
        type: 'overlay', target: 'defender', shape: 'heart',
        color: '#ff1493', outline: '#ff69b4', width: 40, height: 40,
        duration: 400, animation: 'grow'
    }
]);

AnimFramework.register('brick-break', [
    { type: 'sfx', sound: 'fighting' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'claw', // Chop hand
                color: '#fff', outline: '#000', width: 40, height: 10, // Flat hand
                duration: 200, animation: 'slam'
            },
            { type: 'screenFx', class: 'fx-fighting', duration: 300 }
        ]
    },
    { type: 'sfx', sound: 'damage' }, // Breaking sound
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('cross-chop', [
    { type: 'sfx', sound: 'fighting' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    {
        type: 'formation', target: 'defender', pattern: 'xShape',
        shape: 'fist', particleSize: 15, color: '#b22222', outline: '#000',
        duration: 300, stagger: 10
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('hammer-arm', [
    { type: 'sfx', sound: 'fighting' },
    { type: 'spriteMove', target: 'attacker', preset: 'slam' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'fist',
                color: '#b22222', outline: '#000', width: 60, height: 60,
                duration: 400, animation: 'slam'
            },
            { type: 'tilt', angle: 6, duration: 300 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);

AnimFramework.register('seismic-toss', [
    { type: 'sfx', sound: 'fighting' },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.defenderSprite; // Lift defender visually? Or just shake world
            sprite.style.transform = 'translateY(-100px)';
            sprite.style.transition = 'transform 0.5s';
        }
    },
    { type: 'wait', ms: 500 },
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.defenderSprite;
            sprite.style.transform = 'translateY(0)'; // Drop
            sprite.style.transition = 'transform 0.2s cubic-bezier(0.5, 0, 1, 1)';
        }
    },
    { type: 'tilt', angle: 10, duration: 400 },
    { type: 'spriteShake', target: 'defender', duration: 600 }
]);

AnimFramework.register('air-cutter', [
    { type: 'sfx', sound: 'flying' },
    {
        type: 'volley', from: 'attacker', to: 'defender',
        count: 4, interval: 100, travelTime: 300,
        projectile: {
            width: 30, height: 40, // Taller blade/gust
            svgShape: 'gust',
            styles: { background: '#e0ffff', opacity: 0.8 }
        }
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('drill-peck', [
    { type: 'sfx', sound: 'flying' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    {
        type: 'overlay', target: 'defender', shape: 'bird', // Use bird shape as peck
        color: '#f0e68c', outline: '#b8860b', width: 40, height: 40,
        duration: 300, animation: 'strike', count: 3, spread: 20
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('wing-attack', [
    { type: 'sfx', sound: 'flying' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge', x: 50 }, // Swoop
    {
        type: 'overlay', target: 'defender', shape: 'gust', // Wing gust
        color: '#dcdcdc', outline: '#a9a9a9', width: 60, height: 80,
        duration: 300, animation: 'slash'
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('rollout', [
    { type: 'spriteMove', target: 'attacker', preset: 'jump' },
    { type: 'sfx', sound: 'rock' },
    {
        type: 'parallel', steps: [
            { type: 'spriteMove', target: 'attacker', preset: 'charge', duration: 300 },
            {
                type: 'overlay', target: 'defender', shape: 'rock',
                color: '#b8a038', outline: '#000', width: 40, height: 40,
                duration: 400, animation: 'slam', count: 1
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('hidden-power', (ctx) => {
    // Determine type dynamically based on the attacker's stats/level
    const type = (typeof Mechanics !== 'undefined' && ctx.attacker)
        ? Mechanics.getHiddenPowerType(ctx.attacker)
        : 'normal';

    return [
        { type: 'sfx', sound: 'psychic' },
        {
            type: 'orbit', target: 'attacker', shape: 'sparkle',
            radiusX: 40, radiusY: 40, count: 5, speed: 2, duration: 800,
            color: '#fff', outline: '#000', particleSize: 12
        },
        {
            type: 'beam', from: 'attacker', to: 'defender', duration: 400,
            width: 15, height: 15, beamStyles: {
                background: 'white', borderRadius: '50%', boxShadow: '0 0 10px white'
            }
        },
        // Trigger the standard type-specific FX when it hits
        {
            type: 'callback',
            fn: async (c) => {
                const fxName = `fx-${type}`;
                if (AnimFramework.has(fxName)) {
                    await AnimFramework.play(fxName, c);
                }
            }
        },
        { type: 'spriteShake', target: 'defender', duration: 200 }
    ];
});

AnimFramework.register('defense-curl', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 300
    },
    {
        type: 'overlay', target: 'attacker', shape: 'shield',
        color: '#fff', outline: '#000', width: 30, height: 30,
        duration: 400, animation: 'grow'
    }
]);
AnimFramework.register('teleport', [
    { type: 'sfx', sound: 'psychic' },
    {
        type: 'parallel', steps: [
            { type: 'invert', target: 'attacker', duration: 400 },
            { type: 'spriteMove', target: 'attacker', preset: 'jump', duration: 400 }
        ]
    }
]);

AnimFramework.register('roar', [
    { type: 'sfx', sound: 'normal' },
    {
        type: 'parallel', steps: [
            { type: 'tilt', angle: 5, duration: 400 },
            { type: 'spriteShake', target: 'defender', duration: 400 }
        ]
    }
]);
