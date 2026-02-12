/** @type {AnimationEngine} */

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

// --- DRAIN MOVES GENERATOR ---
const createDrainAnim = (intensity = 'low') => {
    let count = 8, size = 4, color = '#90ee90';
    if (intensity === 'med') { count = 12; size = 5; color = '#32cd32'; }
    if (intensity === 'high') { count = 18; size = 6; color = '#006400'; }

    return [
        { type: 'sfx', sound: 'grass' },
        {
            type: 'parallel', steps: [
                {
                    type: 'stream', from: 'defender', to: 'attacker',
                    count: count, interval: 30, spread: 15, travelTime: 500,
                    size: size, color: color, outline: '#004d00', scaleStart: 1.0, scaleEnd: 0.5
                },
                { type: 'screenFx', class: 'fx-grass', duration: 600 },
                { type: 'spriteShake', target: 'defender', duration: 600 }
            ]
        }
    ];
};

AnimFramework.register('absorb', createDrainAnim('low'));
AnimFramework.register('mega-drain', createDrainAnim('med'));
AnimFramework.register('giga-drain', createDrainAnim('high'));

AnimFramework.register('fire-spin', [
    { type: 'sfx', sound: 'fire' },
    { type: 'screenFx', class: 'fx-fire', duration: 1000 },
    {
        type: 'formation', target: 'defender', pattern: 'ring',
        shape: 'fire', particleSize: 10, color: '#ff4500', outline: '#8b0000',
        duration: 1200, stagger: 20
    },
    { type: 'spriteShake', target: 'defender', duration: 1000 }
]);

AnimFramework.register('water-gun', [
    { type: 'sfx', sound: 'water' },
    {
        type: 'stream', from: 'attacker', to: 'defender',
        count: 10, interval: 30, spread: 5, travelTime: 300,
        size: 4, color: '#1e90ff', outline: '#00008b'
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
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
    { type: 'spriteShake', target: 'defender', duration: 400 }
]);

AnimFramework.register('heat-wave', [
    { type: 'sfx', sound: 'fire' },
    { type: 'bgColor', color: '#ff4500', duration: 800 },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 3, duration: 800, speed: 100 },
            {
                type: 'stream', from: { x: 160, y: 50 }, to: 'defender',
                count: 30, interval: 20, spread: 200, travelTime: 500,
                size: 6, color: '#ff8c00', outline: '#8b0000', fade: true
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 500 }
]);

AnimFramework.register('petal-dance', [
    { type: 'sfx', sound: 'grass' },
    { type: 'bgColor', color: '#ffe4e1', duration: 1500 },
    {
        type: 'formation', target: 'scene', pattern: 'ring',
        shape: 'leaf', particleSize: 10, color: '#ff69b4', outline: '#c71585',
        duration: 2000, stagger: 50, count: 20
    },
    {
        type: 'parallel', steps: [
            { type: 'wave', intensity: 2, duration: 1500, speed: 50 },
            { type: 'spriteShake', target: 'defender', duration: 1000 }
        ]
    }
]);

AnimFramework.register('spark', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'electric' },
    {
        type: 'parallel', steps: [
            { type: 'flash', color: '#ffd700', duration: 200, opacity: 0.5 },
            {
                type: 'particles', position: 'defender', count: 8, spread: 20, duration: 300,
                particleStyles: { background: '#ffff00', boxShadow: '0 0 5px #ffd700' }
            }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 200 }
]);

AnimFramework.register('aqua-tail', [
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'sfx', sound: 'water' },
    {
        type: 'parallel', steps: [
            {
                type: 'overlay', target: 'defender', shape: 'water',
                color: '#1e90ff', outline: '#00008b', width: 50, height: 50,
                duration: 300, animation: 'slam'
            },
            { type: 'screenFx', class: 'fx-water', duration: 300 }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 300 }
]);

AnimFramework.register('dive', [
    {
        type: 'callback', fn: ctx => {
            const sprite = ctx.attackerSprite;
            sprite.style.transition = 'none';
            sprite.style.transform = 'translateY(150px)'; // Underwater
            sprite.style.opacity = '1';
        }
    },
    { type: 'wait', ms: 500 },
    { type: 'sfx', sound: 'water' },
    {
        type: 'parallel', steps: [
            {
                type: 'callback', fn: ctx => {
                    const sprite = ctx.attackerSprite;
                    sprite.style.transition = 'transform 0.25s ease-out';
                    sprite.style.transform = 'translateY(0)';
                }
            },
            {
                type: 'stream', from: { x: 160, y: 180 }, to: 'defender',
                count: 15, interval: 20, spread: 30, travelTime: 400,
                size: 6, color: '#1e90ff', outline: '#00008b'
            },
            { type: 'screenFx', class: 'fx-water', duration: 400 }
        ]
    },
    { type: 'spriteShake', target: 'defender', duration: 400 },
    { type: 'callback', fn: ctx => { ctx.attackerSprite.style.transition = ''; ctx.attackerSprite.style.transform = ''; } }
]);

AnimFramework.register('solar-beam', (ctx) => {
    // Solar Beam doesn't "hide" the sprite, but it charges up.
    // If it's the second turn, we want a massive beam.
    return [
        { type: 'sfx', sound: 'charge' },
        { type: 'flash', color: '#fffacd', duration: 400, opacity: 0.5 },
        { type: 'wait', ms: 200 },
        { type: 'sfx', sound: 'beam' },
        {
            type: 'beam', from: 'attacker', to: 'defender', duration: 800,
            width: 40, height: 40, beamStyles: {
                background: 'linear-gradient(to bottom, #fff, #ffd700, #fff)',
                borderRadius: '10px', boxShadow: '0 0 30px #ffd700'
            }
        },
        {
            type: 'parallel', steps: [
                { type: 'screenFx', class: 'fx-grass', duration: 800 },
                { type: 'spriteShake', target: 'defender', duration: 800 }
            ]
        }
    ];
});

AnimFramework.register('rain-dance', [
    { type: 'sfx', sound: 'water' },
    { type: 'bgColor', color: '#000033', duration: 1000 },
    {
        type: 'parallel', steps: [
            { type: 'spriteShake', target: 'attacker', duration: 600 },
            {
                type: 'stream', from: { x: 0, y: -20 }, to: { x: 0, y: 300 }, // Vertical rain
                count: 30, interval: 20, spread: 340, travelTime: 500,
                size: 2, color: '#87cefa', outline: '#4682b4',
                offsetX: 0, offsetY: 0, // Wide spread
            }
        ]
    }
]);

AnimFramework.register('sunny-day', [
    { type: 'sfx', sound: 'fire' },
    { type: 'flash', color: '#fffacd', duration: 600, opacity: 0.6 },
    { type: 'bgColor', color: '#fa8072', duration: 1200 }, // Salmon/Hot
    {
        type: 'parallel', steps: [
            { type: 'spriteMove', target: 'attacker', preset: 'shake', duration: 400 },
            {
                type: 'formation', target: 'scene', pattern: 'ring',
                shape: 'sparkle', particleSize: 12, color: '#ffd700', outline: '#ff4500',
                duration: 1000, stagger: 50
            }
        ]
    }
]);

AnimFramework.register('hail', [
    { type: 'sfx', sound: 'ice' },
    { type: 'bgColor', color: '#f0f8ff', duration: 1000 },
    {
        type: 'parallel', steps: [
            {
                type: 'stream', from: { x: 0, y: -20 }, to: { x: 50, y: 300 }, // Diagonal
                count: 20, interval: 40, spread: 340, travelTime: 600,
                size: 5, color: '#e0ffff', outline: '#b0e0e6'
            },
            { type: 'screenFx', class: 'fx-ice', duration: 800 }
        ]
    }
]);
