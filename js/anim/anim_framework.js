// ============================================================
// ANIMATION FRAMEWORK — Data-Driven Battle Animation Engine
// ============================================================
// Register animations as sequences of declarative steps.
// Each step is { type, ...params }. Steps run sequentially
// unless grouped with 'parallel'.
//
// Step Types:
//   sfx        — Play a sound effect     { sound }
//   cry        — Play a Pokémon cry      { cry }
//   wait       — Pause                   { ms }
//   screenFx   — Flash the scene         { class, duration }
//   spriteShake— Shake/flicker target    { target, duration, flipped? }
//   cssClass   — Toggle CSS class        { el/selector, class, duration }
//   move       — Translate an element    { el/selector, x, y, duration, easing }
//   spawn      — Create a temp DOM el    { parentSelector, className, styles, duration }
//   particles  — Burst of particles      { x, y, count, className, spread, duration }
//   beam       — Projectile from→to      { fromX, fromY, toX, toY, className, duration, width, height }
//   stream     — Continuous particle flow { from, to, count, svgShape?, scaleStart, scaleEnd }
//   volley     — Rapid-fire projectiles   { from, to, count, interval, projectile: { width, height, styles } }
//   flash      — Full-scene flash        { color, duration, opacity }
//   overlay    — SVG shape on target     { target, shape, color, width, height, animation, count }
//   formation  — Particles in a pattern  { target, pattern|points, particleSize, color, shape?, stagger }
//   spriteMove — Move a sprite           { target, preset:'lunge'|'dodge'|'jump'|'recoil'|'charge'|'slam' }
//   tilt       — Tilt/rotate scene       { angle, duration }
//   bgColor    — Flash background color  { color, duration }
//   invert     — Invert colors           { target:'scene'|'attacker'|'defender', duration }
//   wave       — Wavy scene distortion   { intensity, duration, speed }
//   orbit      — Orbiting shapes around target { target, shape, radiusX, radiusY, count, speed, duration, color, outline }
//   spriteMetallic — Grayscale metallic sheen { target, duration, color }
//   callback   — Run arbitrary async fn  { fn }
//   parallel   — Run steps concurrently  { steps: [...] }
//
// Usage:
//   AnimFramework.register('flamethrower', [
//       { type: 'sfx', sound: 'fire' },
//       { type: 'screenFx', class: 'fx-fire', duration: 500 },
//       { type: 'spriteShake', target: 'defender', duration: 400 }
//   ]);
//
//   await AnimFramework.play('flamethrower', { attacker, defender, isPlayerAttacker });
// ============================================================

/** @type {AnimationEngine} */
const AnimFramework = {

    // --- REGISTRY ---
    _registry: {},

    /**
     * Register a named animation sequence.
     * @param {string} name — Unique identifier (e.g. 'flamethrower', 'thunderbolt')
     * @param {AnimStep[]} steps — Array of step objects
     */
    register(name, steps) {
        if (!Array.isArray(steps) && typeof steps !== 'function') {
            console.error(`[AnimFramework] Steps must be an array or function for "${name}"`);
            return;
        }
        this._registry[name.toLowerCase()] = steps;
    },

    /**
     * Check if an animation is registered.
     * @param {string} name
     * @returns {boolean}
     */
    has(name) {
        return !!this._registry[name.toLowerCase()];
    },

    /**
     * List all registered animation names.
     * @returns {string[]}
     */
    list() {
        return Object.keys(this._registry);
    },

    /**
     * Play a registered animation by name.
     * @param {string} name — The animation identifier
     * @param {Object} ctx  — Context: { attacker, defender, isPlayerAttacker, scene?, fxContainer? }
     */
    async play(name, ctx = {}) {
        let steps = this._registry[name.toLowerCase()];
        if (!steps) {
            console.warn(`[AnimFramework] Animation "${name}" not found. Skipping.`);
            return;
        }

        // Build a rich context with resolved DOM elements
        const resolvedCtx = this._resolveContext(ctx);

        // If steps is a function generator, execute it to get the array
        if (typeof steps === 'function') {
            steps = steps(resolvedCtx);
        }

        if (!Array.isArray(steps)) {
            console.error(`[AnimFramework] Animation "${name}" did not resolve to an array.`);
            return;
        }

        for (const step of steps) {
            await this._executeStep(step, resolvedCtx);
        }
    },

    // --- CONTEXT RESOLUTION ---
    _resolveContext(ctx) {
        const scene = ctx.scene || document.getElementById('scene');
        const fxContainer = ctx.fxContainer || document.getElementById('fx-container');

        // Resolve which side is the attacker/defender based on objects if provided
        // This explicitly supports self-targeting (attacker === defender)
        let isPlayerAttacker = ctx.isPlayerAttacker ?? true;
        if (ctx.attacker && typeof Battle !== 'undefined') {
            isPlayerAttacker = (ctx.attacker === Battle.p);
        }

        const attackerSprite = isPlayerAttacker
            ? document.getElementById('player-sprite')
            : document.getElementById('enemy-sprite');

        let defenderSprite;
        if (ctx.defender && typeof Battle !== 'undefined') {
            defenderSprite = (ctx.defender === Battle.p)
                ? document.getElementById('player-sprite')
                : document.getElementById('enemy-sprite');
        } else {
            defenderSprite = isPlayerAttacker
                ? document.getElementById('enemy-sprite')
                : document.getElementById('player-sprite');
        }

        // Canonical positions
        const attackerPos = isPlayerAttacker ? { x: 60, y: 150 } : { x: 230, y: 70 };
        const defenderPos = (ctx.defender && typeof Battle !== 'undefined' && ctx.defender === Battle.p)
            ? { x: 60, y: 150 }
            : (isPlayerAttacker ? { x: 230, y: 70 } : { x: 60, y: 150 });

        return {
            ...ctx,
            scene,
            fxContainer,
            attackerSprite,
            defenderSprite,
            attackerPos,
            defenderPos,
            isPlayerAttacker
        };
    },

    // --- STEP EXECUTOR ---
    async _executeStep(step, ctx) {
        switch (step.type) {

            case 'sfx':
                AudioEngine.playSfx(step.sound);
                if (step.wait) await wait(step.wait);
                break;

            case 'cry':
                if (step.cry) AudioEngine.playCry(step.cry);
                else if (step.target === 'attacker' && ctx.attacker?.cry) AudioEngine.playCry(ctx.attacker.cry);
                else if (step.target === 'defender' && ctx.defender?.cry) AudioEngine.playCry(ctx.defender.cry);
                if (step.wait) await wait(step.wait);
                break;

            case 'wait':
                await wait(step.ms || 200);
                break;

            case 'screenFx':
                this._doScreenFx(step, ctx);
                await wait(step.duration || 500);
                break;

            case 'spriteShake':
                await this._doSpriteShake(step, ctx);
                break;

            case 'cssClass': {
                const el = this._resolveElement(step.el || step.selector, ctx);
                if (el) {
                    el.classList.remove(step.class);
                    UI.forceReflow(el);
                    el.classList.add(step.class);
                    await wait(step.duration || 400);
                    if (!step.persist) el.classList.remove(step.class);
                }
                break;
            }

            case 'move':
                await this._doMove(step, ctx);
                break;

            case 'spawn':
                await this._doSpawn(step, ctx);
                break;

            case 'particles':
                this._doParticles(step, ctx);
                await wait(step.duration || 600);
                break;

            case 'beam':
                await this._doBeam(step, ctx);
                break;

            case 'stream':
                await this._doStream(step, ctx);
                break;

            case 'volley':
                await this._doVolley(step, ctx);
                break;

            case 'flash':
                await this._doFlash(step, ctx);
                break;

            case 'callback':
                if (typeof step.fn === 'function') await step.fn(ctx);
                break;

            case 'parallel':
                if (Array.isArray(step.steps)) {
                    await Promise.all(step.steps.map(s => this._executeStep(s, ctx)));
                }
                break;

            case 'sequence':
                if (Array.isArray(step.steps)) {
                    for (const s of step.steps) {
                        await this._executeStep(s, ctx);
                    }
                }
                break;

            case 'overlay': await this._doOverlay(step, ctx); break;
            case 'formation': await this._doFormation(step, ctx); break;
            case 'spriteMove': await this._doSpriteMove(step, ctx); break;
            case 'tilt': await this._doTilt(step, ctx); break;
            case 'bgColor': await this._doBgColor(step, ctx); break;
            case 'invert': await this._doInvert(step, ctx); break;
            case 'spriteSilhouette': await this._doSpriteSilhouette(step, ctx); break;
            case 'spriteGhost': await this._doSpriteGhost(step, ctx); break;
            case 'wave': await this._doWave(step, ctx); break;
            case 'spriteWave': await this._doSpriteWave(step, ctx); break;
            case 'orbit': await this._doOrbit(step, ctx); break;
            case 'spriteMetallic': await this._doSpriteMetallic(step, ctx); break;

            default:
                console.warn(`[AnimFramework] Unknown step type: "${step.type}"`);
        }
    },

    // --- ELEMENT RESOLUTION ---
    // Accepts: 'attacker', 'defender', 'scene', 'fxContainer', CSS selector, or direct element
    _resolveElement(ref, ctx) {
        if (!ref) return null;
        if (ref instanceof HTMLElement) return ref;
        if (ref === 'attacker') return ctx.attackerSprite;
        if (ref === 'defender') return ctx.defenderSprite;
        if (ref === 'scene') return ctx.scene;
        if (ref === 'fxContainer') return ctx.fxContainer;
        return document.querySelector(ref);
    },

    // Resolve a position that can be 'attacker', 'defender', 'scene' or {x, y}
    _resolvePosition(pos, ctx) {
        if (!pos) return { x: 0, y: 0 };
        if (pos === 'attacker') return ctx.attackerPos;
        if (pos === 'defender') return ctx.defenderPos;
        if (pos === 'scene') return { x: 145, y: 110 }; // Center of the battlefield
        return { x: pos.x || 0, y: pos.y || 0 };
    },

    // --- SCREEN FX ---
    _doScreenFx(step, ctx) {
        const scene = ctx.scene;
        scene.classList.remove(step.class);
        UI.forceReflow(scene);
        scene.classList.add(step.class);
        setTimeout(() => scene.classList.remove(step.class), step.duration || 500);
    },

    // --- SPRITE SHAKE ---
    async _doSpriteShake(step, ctx) {
        const sprite = (step.target === 'attacker') ? ctx.attackerSprite : ctx.defenderSprite;
        if (!sprite) return;

        const isInvisible = step.skipIfInvisible && sprite.style.opacity === '0';
        if (isInvisible) {
            await wait(step.duration || 400);
            return;
        }

        const isFlipped = sprite.classList.contains('sub-back');
        const hitClass = (step.flipped || isFlipped) ? 'anim-shake-only-flipped' : 'anim-shake-only';

        sprite.classList.remove('anim-hit', 'anim-hit-flipped', 'anim-shake-only', 'anim-shake-only-flipped');
        UI.forceReflow(sprite);
        sprite.classList.add(hitClass);

        await wait(step.duration || 400);
        sprite.classList.remove(hitClass);
    },

    // --- MOVE (Translate) ---
    async _doMove(step, ctx) {
        const el = this._resolveElement(step.el || step.selector, ctx);
        if (!el) return;

        const duration = step.duration || 300;
        const easing = step.easing || 'ease-out';

        el.style.transition = `transform ${duration}ms ${easing}`;
        el.style.transform = `translate(${step.x || 0}px, ${step.y || 0}px)`;

        await wait(duration);

        if (step.reset) {
            el.style.transform = '';
            el.style.transition = '';
        }
    },

    // --- SPAWN (Temporary DOM element) ---
    async _doSpawn(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;

        const el = document.createElement(step.tag || 'div');
        el.className = step.className || '';

        // Apply inline styles
        if (step.styles) {
            Object.assign(el.style, step.styles);
        }

        // Apply text content
        if (step.text) el.textContent = step.text;

        parent.appendChild(el);

        const duration = step.duration || 600;
        setTimeout(() => el.remove(), duration);

        await wait(step.waitAfter || duration);
    },

    // --- PARTICLES ---
    _doParticles(step, ctx) {
        const parent = this._resolveElement(step.parent || 'scene', ctx);
        if (!parent) return;

        const pos = this._resolvePosition(step.position || step, ctx);
        const count = step.count || 8;
        const spread = step.spread || 40;
        const duration = step.duration || 600;
        const className = step.className || 'smoke-particle';

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = className;

            const angle = (i / count) * 2 * Math.PI;
            const velocity = spread + Math.random() * (spread * 0.4);
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            p.style.left = pos.x + 'px';
            p.style.top = pos.y + 'px';
            p.style.setProperty('--tx', tx + 'px');
            p.style.setProperty('--ty', ty + 'px');
            p.style.imageRendering = 'pixelated';

            // Override styles
            if (step.particleStyles) {
                Object.assign(p.style, step.particleStyles);
            }

            parent.appendChild(p);
            setTimeout(() => p.remove(), duration);
        }
    },

    // --- BEAM (Projectile from → to) ---
    async _doBeam(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;

        const from = this._resolvePosition(step.from || 'attacker', ctx);
        const to = this._resolvePosition(step.to || 'defender', ctx);
        const duration = step.duration || 400;
        const width = step.width || 6;
        const height = step.height || 6;

        const beam = document.createElement('div');
        beam.className = step.className || 'beam-projectile';

        // Calculate angle
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        Object.assign(beam.style, {
            position: 'absolute',
            left: from.x + 'px',
            top: from.y + 'px',
            width: width + 'px',
            height: height + 'px',
            transform: `rotate(${angle}deg)`,
            transition: `left ${duration}ms linear, top ${duration}ms linear`,
            zIndex: '30',
            pointerEvents: 'none',
            ...(step.beamStyles || {})
        });

        parent.appendChild(beam);

        // Trigger the movement after a frame
        requestAnimationFrame(() => {
            beam.style.left = to.x + 'px';
            beam.style.top = to.y + 'px';
        });

        await wait(duration);
        beam.remove();
    },

    // --- FLASH (Full-scene color flash) ---
    async _doFlash(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;

        const duration = step.duration || 300;
        const color = step.color || 'white';
        const opacity = step.opacity ?? 0.8;

        const flash = document.createElement('div');
        Object.assign(flash.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: color,
            opacity: String(opacity),
            pointerEvents: 'none',
            zIndex: step.zIndex || '500',
            transition: `opacity ${duration * 0.6}ms ease-out`
        });

        parent.appendChild(flash);

        // Fade out
        await wait(duration * 0.4);
        flash.style.opacity = '0';
        await wait(duration * 0.6);
        flash.remove();
    },

    // --- STREAM (Continuous particle flow from → to) ---
    // 8-bit style: square pixels, hard outlines, optional size scaling.
    // scaleStart/scaleEnd let particles grow during travel (e.g. fire flames).
    async _doStream(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;

        const from = this._resolvePosition(step.from || 'attacker', ctx);
        const to = this._resolvePosition(step.to || 'defender', ctx);

        const count = step.count || 15;
        const interval = step.interval || 35;
        const spread = step.spread || 12;
        const travelTime = step.travelTime || 400;
        const size = step.size || 6;
        const color = step.color || '#ff4500';
        const outline = step.outline || null;       // Hard pixel outline color
        const fade = step.fade !== false;
        const scaleStart = step.scaleStart || 1;    // Starting scale multiplier
        const scaleEnd = step.scaleEnd || 1;        // Ending scale multiplier

        // Direction vector
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Perpendicular vector for spread
        const perpX = -dy / dist;
        const perpY = dx / dist;

        for (let i = 0; i < count; i++) {
            const offset = (Math.random() - 0.5) * 2 * spread;
            const startX = from.x + perpX * offset;
            const startY = from.y + perpY * offset;

            const endOffset = (Math.random() - 0.5) * spread * 0.6;
            const endX = to.x + perpX * endOffset;
            const endY = to.y + perpY * endOffset;

            const pSize = size + (Math.random() - 0.5) * (size * 0.4);
            const shadow = outline
                ? `1px 0 0 ${outline}, -1px 0 0 ${outline}, 0 1px 0 ${outline}, 0 -1px 0 ${outline}`
                : 'none';

            const hasScale = scaleStart !== scaleEnd;
            let transition = `left ${travelTime}ms linear, top ${travelTime}ms linear`;
            if (hasScale) transition += `, transform ${travelTime}ms linear`;
            if (fade) transition += `, opacity ${travelTime}ms ease-in`;

            // Create particle: SVG shape or plain pixel div
            let p;
            if (step.svgShape && this._shapes[step.svgShape]) {
                p = this._createShapeEl(step.svgShape, pSize, pSize, color, outline);
            }
            if (!p) {
                p = document.createElement('div');
                Object.assign(p.style, {
                    width: pSize + 'px', height: pSize + 'px',
                    borderRadius: '0', background: color,
                    boxShadow: shadow, imageRendering: 'pixelated',
                    ...(step.particleStyles || {})
                });
            }

            Object.assign(p.style, {
                position: 'absolute',
                left: startX + 'px', top: startY + 'px',
                opacity: '1', pointerEvents: 'none', zIndex: '25',
                transform: `scale(${scaleStart})`, transition: transition,
            });

            parent.appendChild(p);

            requestAnimationFrame(() => {
                p.style.left = endX + 'px';
                p.style.top = endY + 'px';
                if (hasScale) p.style.transform = `scale(${scaleEnd})`;
                if (fade) p.style.opacity = '0.2';
            });

            setTimeout(() => p.remove(), travelTime + 50);
            if (i < count - 1) await wait(interval);
        }

        await wait(travelTime);
    },

    // --- VOLLEY (Rapid-fire projectiles from → to) ---
    // 8-bit style: hard-edged pixel projectiles fired in succession.
    async _doVolley(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;

        const from = this._resolvePosition(step.from || 'attacker', ctx);
        const to = this._resolvePosition(step.to || 'defender', ctx);

        const count = step.count || 5;
        const interval = step.interval || 100;
        const travelTime = step.travelTime || 250;
        const projectile = step.projectile || {};
        const width = projectile.width || 8;
        const height = projectile.height || 4;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;

            const p = document.createElement('div');
            Object.assign(p.style, {
                position: 'absolute',
                left: (from.x + offsetX) + 'px',
                top: (from.y + offsetY) + 'px',
                width: width + 'px',
                height: height + 'px',
                transform: `rotate(${angle}deg)`,
                transition: `left ${travelTime}ms linear, top ${travelTime}ms linear`,
                zIndex: '30',
                pointerEvents: 'none',
                borderRadius: '0',
                imageRendering: 'pixelated',
                ...(projectile.styles || {})
            });

            parent.appendChild(p);

            requestAnimationFrame(() => {
                p.style.left = (to.x + offsetX) + 'px';
                p.style.top = (to.y + offsetY) + 'px';
            });

            setTimeout(() => p.remove(), travelTime + 50);
            if (i < count - 1) await wait(interval);
        }

        await wait(travelTime);
    },

    // === SVG SHAPE LIBRARY ===
    // 8-bit pixel-art shapes. Each has a viewBox and SVG path data.
    _shapes: {
        lightning: { vb: '0 0 16 32', d: 'M9.5 1 L4 18 L10.5 18 L6.5 31 L14 13 L8 13 Z' }, // Sharper, offset zag
        fire: { vb: '0 0 16 16', d: 'M8 1 C5 1 2 6 2 10.5 C2 13.5 4.5 16 8 16 C11.5 16 14 13.5 14 10.5 C14 6 11 1 8 1 Z M8 5 C9.5 7 11 9 11 11.5 C11 13 9.7 14 8 14 C6.3 14 5 13 5 11.5 C5 9 6.5 7 8 5 Z' }, // Smooth tear drop with inner flame
        water: { vb: '0 0 16 16', d: 'M8 1 C4 6 2 9 2 11.5 C2 14.5 4.7 16 8 16 C11.3 16 14 14.5 14 11.5 C14 9 12 6 8 1 Z' }, // Classic smooth teardrop
        leaf: { vb: '0 0 16 16', d: 'M14 2 C14 2 8 0 3 5 C-1.5 9.5 0 16 0 16 C0 16 6.5 17.5 11 13 C16 8 14 2 14 2 Z M1.5 14.5 L12 4' }, // Organic curve with a stem line
        star: { vb: '0 0 16 16', d: 'M8 0.5 L10.3 5.5 L15.5 6.2 L11.7 10 L12.7 15.5 L8 12.8 L3.3 15.5 L4.3 10 L0.5 6.2 L5.7 5.5 Z' }, // Perfect 5-point star
        claw: { vb: '0 0 16 16', d: 'M-1 4 C2 6 6 10 9 13 L6 16 C3 12 -1 7 -4 4 Z M3 -1 C6 2 10 6 13 9 L10 12 C7 8 2 4 -1 1 Z M8 -4 C11 -1 15 3 18 6 L15 9 C11 5 7 1 4 -2 Z' }, // 45-degree angled, sharp slashes
        fist: { vb: '0 0 16 16', d: 'M4 3 C4 2 5 1 6 1 L11 1 C12 1 13 2 13 3 L13 6 C14 6 15 7 15 8 L15 12 C15 14 13 16 10 16 L5 16 C3 16 1 14 1 12 L1 8 C1 6 2 6 3 6 L3 3 Z M4 6 L12 6 M4 9 L12 9 M4 12 L12 12' }, // Rounded knuckle fist
        skull: { vb: '0 0 16 16', d: 'M8 0 C3 0 1 3 1 7 C1 10 3 11 4 11 L4 14 C4 15 5 16 6 16 L10 16 C11 16 12 15 12 14 L12 11 C13 11 15 10 15 7 C15 3 13 0 8 0 Z M4.5 5.5 A2 2 0 1 0 4.5 9.5 A2 2 0 1 0 4.5 5.5 Z M11.5 5.5 A2 2 0 1 0 11.5 9.5 A2 2 0 1 0 11.5 5.5 Z M8 10.5 L8 12' }, // Smooth cranium with eye holes and nose slit
        spiral: { vb: '0 0 16 16', d: 'M8 8 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 m1 0 a6 6 0 1 1 12 0 a6 6 0 1 1 -12 0 m1 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 m1 0 a4 4 0 1 1 8 0 a4 4 0 1 1 -8 0 m1 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 m1 0 a2 2 0 1 1 4 0 a2 2 0 1 1 -4 0 m1 0 a1 1 0 1 0 2 0 a1 1 0 1 0 -2 0' }, // Dense, perfect concentric rings for hypnosis
        bird: { vb: '0 0 16 10', d: 'M8 8 C5 6 1 0 0 1 C3 4 5 7 8 10 C11 7 13 4 16 1 C15 0 11 6 8 8 Z' }, // Smooth sweeping gull wings
        duck: { vb: '0 0 16 16', d: 'M8 6 C3 6 3 14 8 14 C13 14 13 6 8 6 Z M8 6 C8 1 13 1 13 6 Z M13 3 L16 4' }, // Rounded duck shape
        rock: { vb: '0 0 16 16', d: 'M5 1 L11 1 L15 5 L14 11 L10 15 L3 14 L1 9 Z M5 1 C7 5 12 4 15 5 M1 9 C4 11 8 10 14 11 M3 14 C5 10 9 12 10 15' }, // Jagged but polygon-smooth rock with inner facet lines
        sparkle: { vb: '0 0 16 16', d: 'M8 0 C8 5 11 8 16 8 C11 8 8 11 8 16 C8 11 5 8 0 8 C5 8 8 5 8 0 Z' }, // Beautiful curved 4-point lens flare sparkle
        music: { vb: '0 0 16 16', d: 'M4 11 A3 3 0 1 1 5 10 L5 3 L13 1 L13 9 A3 3 0 1 1 14 8 L14 0 L4 2 Z' }, // Proper double eighth note with smooth tails
        heart: { vb: '0 0 16 16', d: 'M8 4.5 C8 4.5 6 -1 2 2 C-2 5 2 10 8 15 C14 10 18 5 14 2 C10 -1 8 4.5 8 4.5 Z' }, // Perfect bezier heart
        eye: { vb: '0 0 16 16', d: 'M8 2 C3 2 0 8 0 8 C0 8 3 14 8 14 C13 14 16 8 16 8 C16 8 13 2 8 2 Z M8 5 A3 3 0 1 0 8 11 A3 3 0 1 0 8 5 Z M8 6.5 A1.5 1.5 0 1 1 8 9.5 A1.5 1.5 0 1 1 8 6.5 Z' }, // Smooth almond eye with iris and pupil
        bubble: { vb: '0 0 16 16', d: 'M8 0 A8 8 0 1 1 7.9 0 Z M12 4 A3 3 0 0 0 9 2' }, // Perfect circle with a curved highlight
        zzz: { vb: '0 0 16 12', d: 'M0 1 L9 1 L2 9 L11 9' }, // Sleep Z (using stroke for rendering width)
        drop: { vb: '0 0 8 12', d: 'M4 0 C4 0 0 5 0 8 A4 4 0 0 0 8 8 C8 5 4 0 4 0 Z' }, // Tensioned teardrop (sweat)
        shield: { vb: '0 0 16 16', d: 'M8 0 L15 3 C15 9 12 14 8 16 C4 14 1 9 1 3 Z M8 2 L13 4 C13 8 11 12 8 14 C5 12 3 8 3 4 Z' }, // Heraldic curved shield with inner rim
        wall: { vb: '0 0 16 16', d: 'M0 2 L16 2 L16 14 L0 14 Z M4 2 L4 14 M12 2 L12 14 M0 6 L16 6 M0 10 L16 10' }, // Brick wall grid lines
        anger: { vb: '0 0 16 16', d: 'M2 2 L6 6 L2 10 M14 2 L10 6 L14 10 M5 1 L9 5 L13 1 M5 15 L9 11 L13 15' }, // Expanding 4-point vein pop
        // New Shapes
        bite: { vb: '0 0 16 12', d: 'M0 8 C0 3 4 0 8 0 C12 0 16 3 16 8 C16 13 12 16 8 16 C4 16 0 13 0 8 Z M1 8 L4 11 L6 8 L8 12 L10 8 L12 11 L15 8 L12 5 L10 8 L8 4 L6 8 L4 5 Z' }, // Deprecated combined bite
        'jaw-top': { vb: '0 0 16 8', d: 'M0 8 C0 2 4 0 8 0 C12 0 16 2 16 8 L14 4 L12 8 L10 4 L8 8 L6 4 L4 8 L2 4 Z' }, // Upper jaw with teeth
        'jaw-bottom': { vb: '0 0 16 8', d: 'M0 0 L2 4 L4 0 L6 4 L8 0 L10 4 L12 0 L14 4 L16 0 C16 6 12 8 8 8 C4 8 0 6 0 0 Z' }, // Lower jaw with teeth
        kick: { vb: '0 0 16 16', d: 'M5 14 L15 14 C16 14 16 13 15 12 L11 8 L11 2 C11 1 9 1 9 2 L9 8 L5 11 L3 7 L1 8 L4 13 Z' }, // Shoe/foot profile
        poison: { vb: '0 0 16 16', d: 'M8 1 C4 4 1 8 1 11 C1 14 4 16 8 16 C12 16 15 14 15 11 C15 8 12 4 8 1 Z M4 11 A1.5 1.5 0 1 1 7 11 A1.5 1.5 0 1 1 4 11 Z M9 12 A1 1 0 1 1 11 12 A1 1 0 1 1 9 12 Z' }, // Sludge drop with bubbles
        snow: { vb: '0 0 16 16', d: 'M8 0 L8 16 M0 8 L16 8 M2.3 2.3 L13.7 13.7 M2.3 13.7 L13.7 2.3 M8 4 L6 2 M8 4 L10 2 M8 12 L6 14 M8 12 L10 14 M4 8 L2 6 M4 8 L2 10 M12 8 L14 6 M12 8 L14 10' }, // 6-point snowflake with branches
        gust: { vb: '0 0 16 24', d: 'M2 22 C6 24 14 24 14 21 C14 18 6 18 4 16 C2 14 12 14 12 11 C12 8 4 8 2 6 C0 4 10 4 10 1' }, // Tall spinning tornado shape
        spike: { vb: '0 0 16 16', d: 'M8 0 L10 6 L16 8 L10 10 L8 16 L6 10 L0 8 L6 6 Z' } // Uses a sharp 4-point caltrop star
    },

    // Create an SVG element from a shape definition
    _createShapeEl(name, w, h, color, outline) {
        const s = this._shapes[name];
        if (!s) return null;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', s.vb);
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(h));
        svg.style.shapeRendering = 'crispEdges';
        svg.style.overflow = 'visible';
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', s.d);
        path.setAttribute('fill', color);
        if (outline) { path.setAttribute('stroke', outline); path.setAttribute('stroke-width', '1'); }
        svg.appendChild(path);
        return svg;
    },

    // === FORMATION PATTERNS ===
    // Arrays of {x,y} offsets from center for formation step.
    _formations: {
        fireBlast: [ // 大 kanji
            { x: 0, y: -20 }, { x: 0, y: -12 }, { x: 0, y: -4 }, { x: 0, y: 4 }, { x: 0, y: 12 }, { x: 0, y: 20 },
            { x: -8, y: -4 }, { x: -16, y: -4 }, { x: 8, y: -4 }, { x: 16, y: -4 },
            { x: -8, y: 4 }, { x: -16, y: 12 }, { x: -24, y: 20 }, { x: 8, y: 4 }, { x: 16, y: 12 }, { x: 24, y: 20 },
        ],
        cross: [
            { x: 0, y: -12 }, { x: 0, y: -6 }, { x: 0, y: 0 }, { x: 0, y: 6 }, { x: 0, y: 12 },
            { x: -12, y: 0 }, { x: -6, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 },
        ],
        ring: [
            { x: 0, y: -16 }, { x: 11, y: -11 }, { x: 16, y: 0 }, { x: 11, y: 11 },
            { x: 0, y: 16 }, { x: -11, y: 11 }, { x: -16, y: 0 }, { x: -11, y: -11 },
        ],
        xShape: [
            { x: -16, y: -16 }, { x: -8, y: -8 }, { x: 0, y: 0 }, { x: 8, y: 8 }, { x: 16, y: 16 },
            { x: 16, y: -16 }, { x: 8, y: -8 }, { x: -8, y: 8 }, { x: -16, y: 16 },
        ],
        sparkle: [
            { x: -12, y: -12 }, { x: 12, y: -10 }, { x: -8, y: 14 }, { x: 14, y: 12 },
            { x: 0, y: -18 }, { x: -18, y: 0 }, { x: 18, y: 2 }, { x: 0, y: 18 },
        ],
        rise: [
            { x: -10, y: 20 }, { x: 0, y: 20 }, { x: 10, y: 20 },
            { x: -5, y: 10 }, { x: 5, y: 10 },
            { x: 0, y: 0 },
            { x: -5, y: -10 }, { x: 5, y: -10 },
            { x: 0, y: -20 }
        ]
    },

    // === SPRITE MOVEMENT PRESETS ===
    _getMovePreset(preset, ctx, target) {
        const isPlayer = (target === 'attacker') ? ctx.isPlayerAttacker : !ctx.isPlayerAttacker;
        const dX = isPlayer ? 1 : -1;
        const dY = isPlayer ? -1 : 1;
        switch (preset) {
            case 'lunge': return [{ x: 30 * dX, y: 10 * dY, dur: 120 }, { x: 0, y: 0, dur: 120 }];
            case 'dodge': return [{ x: -20 * dX, y: 0, dur: 80 }, { x: 0, y: 0, dur: 80 }];
            case 'jump': return [{ x: 0, y: -20, dur: 120 }, { x: 0, y: 0, dur: 120 }];
            case 'recoil': return [{ x: -15 * dX, y: -5 * dY, dur: 100 }, { x: 0, y: 0, dur: 200 }];
            case 'charge': return [{ x: 60 * dX, y: 20 * dY, dur: 200 }, { x: 0, y: 0, dur: 200 }];
            case 'slam': return [{ x: 0, y: -25, dur: 150 }, { x: 0, y: 5, dur: 80 }, { x: 0, y: 0, dur: 80 }];
            case 'float': return [{ x: 0, y: -10, dur: 300 }, { x: 0, y: 0, dur: 300 }];
            case 'shake': return [{ x: -6, y: 0, dur: 50 }, { x: 6, y: 0, dur: 50 }, { x: -6, y: 0, dur: 50 }, { x: 6, y: 0, dur: 50 }, { x: 0, y: 0, dur: 50 }];
            default: return [{ x: 0, y: 0, dur: 200 }];
        }
    },

    // === OVERLAY (SVG shape on target) ===
    async _doOverlay(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;
        const pos = this._resolvePosition(step.target || 'defender', ctx);
        const w = step.width || 24, h = step.height || 48;
        const duration = step.duration || 400;
        const anim = step.animation || 'grow';
        const color = step.color || '#ffd700';
        const outline = step.outline || null;
        const count = step.count || 1;
        const spread = step.spread || 0;
        const stagger = step.stagger || 0;

        for (let i = 0; i < count; i++) {
            const ox = count > 1 ? (Math.random() - 0.5) * spread * 2 : 0;
            const oy = count > 1 ? (Math.random() - 0.5) * spread * 2 : 0;
            let shape = step.shape;
            if (anim === 'crunch') {
                shape = (i % 2 === 0) ? 'jaw-top' : 'jaw-bottom';
            }

            let el = (shape && this._shapes[shape])
                ? this._createShapeEl(shape, w, h, color, outline)
                : null;
            if (!el) {
                el = document.createElement('div');
                Object.assign(el.style, { width: w + 'px', height: h + 'px', background: color, borderRadius: '0', imageRendering: 'pixelated' });
            }
            const base = { position: 'absolute', pointerEvents: 'none', zIndex: '40' };
            if (anim === 'strike') {
                Object.assign(base, {
                    left: (pos.x - w / 2 + ox) + 'px', top: (pos.y - h - 30 + oy) + 'px', opacity: '1',
                    transition: `top ${duration * 0.3}ms ease-in, opacity ${duration * 0.4}ms ease-out ${duration * 0.5}ms`
                });
            } else if (anim === 'slash') {
                Object.assign(base, {
                    left: (pos.x - w + ox) + 'px', top: (pos.y - h + oy) + 'px', opacity: '1',
                    transition: `left ${duration * 0.25}ms cubic-bezier(.17,.67,.29,.99), top ${duration * 0.25}ms cubic-bezier(.17,.67,.29,.99), opacity ${duration * 0.4}ms ease-out ${duration * 0.4}ms`
                });
            } else if (anim === 'slam') {
                Object.assign(base, {
                    left: (pos.x - w / 2 + ox) + 'px', top: (pos.y - h * 2 + oy) + 'px', opacity: '1', transform: 'scale(0.5)',
                    transition: `top ${duration * 0.25}ms ease-in, transform ${duration * 0.25}ms ease-in, opacity ${duration * 0.4}ms ease-out ${duration * 0.5}ms`
                });
            } else if (anim === 'crunch') {
                const isBottom = i % 2 === 1;
                Object.assign(base, {
                    left: (pos.x - w / 2 + ox) + 'px',
                    top: (isBottom ? pos.y + h / 2 + 10 : pos.y - h * 1.5 - 10) + 'px',
                    opacity: '1',
                    transition: `top ${duration * 0.3}ms cubic-bezier(.17,.67,.29,.99), opacity ${duration * 0.4}ms ease-out ${duration * 0.5}ms`
                });
            } else { // grow / fade
                Object.assign(base, {
                    left: (pos.x - w / 2 + ox) + 'px', top: (pos.y - h / 2 + oy) + 'px',
                    opacity: anim === 'fade' ? '0' : '1', transform: anim === 'grow' ? 'scale(0)' : 'scale(1)',
                    transition: `transform ${duration * 0.3}ms ease-out, opacity ${duration * 0.3}ms ease-in`
                });
            }
            Object.assign(el.style, base);
            parent.appendChild(el);

            setTimeout(() => {
                requestAnimationFrame(() => {
                    if (anim === 'strike') { el.style.top = (pos.y - h / 2 + oy) + 'px'; }
                    else if (anim === 'slash') { el.style.left = (pos.x - w / 2 + ox) + 'px'; el.style.top = (pos.y - h / 2 + oy) + 'px'; }
                    else if (anim === 'slam') { el.style.top = (pos.y - h / 2 + oy) + 'px'; el.style.transform = 'scale(1)'; }
                    else if (anim === 'crunch') { el.style.top = (i % 2 === 1 ? pos.y + oy : pos.y - h + oy) + 'px'; }
                    else if (anim === 'grow') { el.style.transform = 'scale(1)'; }
                    else if (anim === 'fade') { el.style.opacity = '1'; }
                    setTimeout(() => { el.style.opacity = '0'; }, duration * 0.6);
                });
                setTimeout(() => el.remove(), duration);
            }, i * stagger);
        }
        await wait(duration + (count * stagger));
    },

    // === FORMATION (particles in a pattern) ===
    async _doFormation(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;
        const pos = this._resolvePosition(step.target || 'defender', ctx);
        const points = Array.isArray(step.points) ? step.points : (this._formations[step.pattern] || this._formations.cross);
        const sz = step.particleSize || 6;
        const color = step.color || '#ff4500';
        const outline = step.outline || null;
        const duration = step.duration || 600;
        const stagger = step.stagger || 20;
        const shadow = outline ? `1px 0 0 ${outline},-1px 0 0 ${outline},0 1px 0 ${outline},0 -1px 0 ${outline}` : 'none';

        const els = [];
        for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            let el = (step.shape && this._shapes[step.shape])
                ? this._createShapeEl(step.shape, sz, sz, color, outline)
                : null;
            if (!el) {
                el = document.createElement('div');
                Object.assign(el.style, { width: sz + 'px', height: sz + 'px', background: color, boxShadow: shadow, borderRadius: '0', imageRendering: 'pixelated' });
            }
            Object.assign(el.style, {
                position: 'absolute', left: (pos.x + pt.x - sz / 2) + 'px', top: (pos.y + pt.y - sz / 2) + 'px',
                pointerEvents: 'none', zIndex: '35', opacity: '0', transform: 'scale(0)',
                transition: 'opacity 100ms ease-out, transform 150ms ease-out',
            });
            parent.appendChild(el);
            els.push(el);
            setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'scale(1)'; }, stagger * i);
        }
        await wait(stagger * points.length + 150);
        await wait(duration);
        els.forEach(el => {
            el.style.transition = 'opacity 200ms ease-out, transform 200ms ease-out';
            el.style.opacity = '0'; el.style.transform = 'scale(1.5)';
        });
        await wait(250);
        els.forEach(el => el.remove());
    },

    // === SPRITE MOVE (with presets) ===
    async _doSpriteMove(step, ctx) {
        const target = step.target || 'attacker';
        const sprite = (target === 'attacker') ? ctx.attackerSprite : ctx.defenderSprite;
        if (!sprite) return;
        if (step.preset) {
            const wps = this._getMovePreset(step.preset, ctx, target);
            for (const wp of wps) {
                sprite.style.transition = `transform ${wp.dur}ms ease-out`;
                sprite.style.transform = `translate(${wp.x}px, ${wp.y}px)`;
                await wait(wp.dur);
            }
        } else {
            const dur = step.duration || 200;
            sprite.style.transition = `transform ${dur}ms ${step.easing || 'ease-out'}`;
            sprite.style.transform = `translate(${step.x || 0}px, ${step.y || 0}px)`;
            await wait(dur);
            if (step.reset !== false) {
                sprite.style.transform = 'translate(0,0)'; await wait(dur);
            }
        }
        sprite.style.transition = ''; sprite.style.transform = '';
    },

    // === TILT ===
    async _doTilt(step, ctx) {
        const scene = ctx.scene;
        const angle = step.angle || 3, dur = step.duration || 300;
        scene.style.transition = `transform ${dur * 0.3}ms ease-out`;
        scene.style.transform = `rotate(${angle}deg)`;
        await wait(dur * 0.3);
        scene.style.transition = `transform ${dur * 0.7}ms ease-in-out`;
        scene.style.transform = 'rotate(0deg)';
        await wait(dur * 0.7);
        scene.style.transition = ''; scene.style.transform = '';
    },

    // === BG COLOR ===
    async _doBgColor(step, ctx) {
        const parent = ctx.scene;
        const dur = step.duration || 500;
        const color = step.color || '#000';

        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: color,
            zIndex: '0', // Lowest possible to stay behind sprites/HUD
            opacity: '0',
            pointerEvents: 'none',
            transition: `opacity ${dur * 0.2}ms ease-out`
        });

        // Insert at the bottom of the stack (before particles/sprites)
        // If particles are in fx-container (which is usually first child),
        // we want this BEHIND fx-container if possible, or at least behind sprites.
        // Inserting before firstChild puts it at the very bottom of DOM order within scene.
        if (parent.firstChild) {
            parent.insertBefore(overlay, parent.firstChild);
        } else {
            parent.appendChild(overlay);
        }

        // Trigger reflow
        overlay.offsetHeight;

        // Fade In
        overlay.style.opacity = '1';

        await wait(dur * 0.7);

        // Fade Out
        overlay.style.transition = `opacity ${dur * 0.3}ms ease-in`;
        overlay.style.opacity = '0';

        await wait(dur * 0.3);

        overlay.remove();
    },

    // === INVERT ===
    async _doInvert(step, ctx) {
        const t = step.target || 'scene';
        const el = (t === 'attacker') ? ctx.attackerSprite : (t === 'defender') ? ctx.defenderSprite : ctx.scene;
        if (!el) return;
        const dur = step.duration || 400;
        const orig = el.style.filter || '';
        el.style.transition = 'filter 80ms steps(2)';
        el.style.filter = 'invert(1)';
        await wait(dur);
        el.style.filter = orig;
        await wait(80);
        el.style.transition = '';
    },

    // === WAVE ===
    async _doWave(step, ctx) {
        const scene = ctx.scene;
        const intensity = step.intensity || 3;
        const dur = step.duration || 600;
        const speed = step.speed || 100;
        const cycles = Math.ceil(dur / speed);
        let styleEl = document.getElementById('anim-wave-style');
        if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'anim-wave-style'; document.head.appendChild(styleEl); }
        styleEl.textContent = `@keyframes anim-wave {
            0%,100% { transform: skewX(0deg) skewY(0deg); }
            25% { transform: skewX(${intensity}deg) skewY(${intensity * 0.3}deg); }
            75% { transform: skewX(-${intensity}deg) skewY(-${intensity * 0.3}deg); }
        }`;
        scene.style.animation = `anim-wave ${speed}ms ease-in-out ${cycles}`;
        await wait(dur);
        scene.style.animation = '';
    },

    // --- SPRITE SILHOUETTE (Solid Color Overlay) ---
    async _doSpriteSilhouette(step, ctx) {
        const targetName = step.target || 'defender';
        const sprite = (targetName === 'attacker') ? ctx.attackerSprite : ctx.defenderSprite;
        if (!sprite) return;

        const color = step.color || '#ffffff';
        const duration = step.duration || 600;
        const hold = step.hold || 0;
        const follow = step.follow !== false; // Default to true

        // Ensure we have an SVG filter for this color
        const filterId = this._ensureSilhouetteFilter(color);

        const clone = sprite.cloneNode(true);

        // Setup clone
        clone.id = `silhouette-clone-${Date.now()}`;

        // Function to copy EXACT layout and transforms
        const syncStyles = () => {
            const currentStyle = window.getComputedStyle(sprite);
            const props = ['position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'transform', 'transformOrigin', 'margin', 'display'];
            props.forEach(prop => clone.style[prop] = currentStyle[prop]);
        };
        syncStyles();

        clone.style.filter = `url(#${filterId})`;
        clone.style.opacity = '1';
        clone.style.transition = `opacity ${duration}ms ease-out`;
        clone.style.zIndex = '11';
        clone.style.pointerEvents = 'none';

        // Add to parent
        sprite.parentNode.appendChild(clone);

        // Keep synced if follow is enabled
        let active = true;
        if (follow) {
            const followLoop = () => {
                if (!active) return;
                syncStyles();
                requestAnimationFrame(followLoop);
            };
            followLoop();
        }

        if (hold > 0) await wait(hold);

        // Start fade
        requestAnimationFrame(() => {
            clone.style.opacity = '0';
        });

        await wait(duration);
        active = false;
        clone.remove();
    },

    // --- SPRITE GHOST (Stationary Snapshot) ---
    async _doSpriteGhost(step, ctx) {
        // Reuse silhouette logic but forced follow:false
        return this._doSpriteSilhouette({ ...step, follow: false }, ctx);
    },

    // Helper: Ensure a solid color filter exists in the DOM
    _ensureSilhouetteFilter(color) {
        const cleanColor = color.replace('#', '');
        const id = `glow-${cleanColor}`;
        if (document.getElementById(id)) return id;

        let container = document.getElementById('anim-filters');
        if (!container) {
            // Create hidden SVG container for filters
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.id = 'anim-filters';
            svg.setAttribute('style', 'position:absolute; width:0; height:0; pointer-events:none;');

            // Need to append to body but SVG elements aren't HTMLElements in TS/Lint
            document.body.appendChild(svg);
            container = svg;
        }

        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.id = id;

        // Solid silhouette logic: SourceAlpha -> Colored Flood -> Combined
        filter.innerHTML = `
            <feFlood flood-color="${color}" flood-opacity="1" result="flood" />
            <feComposite in="flood" in2="SourceAlpha" operator="in" />
        `;

        container.appendChild(filter);
        return id;
    },

    // --- SPRITE WAVE (Distortion/Wiggle) ---
    async _doSpriteWave(step, ctx) {
        const sprite = (step.target === 'attacker') ? ctx.attackerSprite : ctx.defenderSprite;
        if (!sprite) return;

        const intensity = step.intensity || 3;
        const dur = step.duration || 600;
        const speed = step.speed || 100;
        const cycles = Math.ceil(dur / speed);

        const keyframeName = `anim-sprite-wave-${Date.now()}`;
        let styleEl = document.getElementById('anim-sprite-wave-style');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'anim-sprite-wave-style';
            document.head.appendChild(styleEl);
        }

        styleEl.textContent += `\n@keyframes ${keyframeName} {
            0%, 100% { transform: skewX(0deg) skewY(0deg); }
            25% { transform: skewX(${intensity}deg) skewY(${intensity * 0.3}deg); }
            75% { transform: skewX(-${intensity}deg) skewY(-${intensity * 0.3}deg); }
        }`;

        sprite.style.animation = `${keyframeName} ${speed}ms ease-in-out ${cycles}`;
        await wait(dur);
        sprite.style.animation = '';
    },

    // --- ORBIT (Rotating shapes in ellipsis/circle) ---
    async _doOrbit(step, ctx) {
        const parent = this._resolveElement(step.parent || 'fxContainer', ctx);
        if (!parent) return;
        const pos = this._resolvePosition(step.target || 'defender', ctx);

        const count = step.count || 3;
        const duration = step.duration || 1000;
        const radiusX = step.radiusX || 30;
        const radiusY = step.radiusY || 10;
        const yOffset = step.yOffset || -40; // Aiming for head height
        const speed = step.speed || 1; // Rotations per second
        const color = step.color || '#ffd700';
        const outline = step.outline || '#b8860b';
        const size = step.particleSize || 16;
        const shape = step.shape || 'duck';

        const els = [];
        for (let i = 0; i < count; i++) {
            const el = this._createShapeEl(shape, size, size, color, outline);
            if (!el) continue;

            Object.assign(el.style, {
                position: 'absolute',
                pointerEvents: 'none',
                zIndex: '45',
                opacity: '0',
                transition: 'opacity 300ms ease-out'
            });
            parent.appendChild(el);
            els.push({ el, angle: (i / count) * Math.PI * 2 });
        }

        const startTime = Date.now();
        els.forEach(item => item.el.style.opacity = '1');

        return new Promise((resolve) => {
            const update = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed >= duration) {
                    els.forEach(item => item.el.remove());
                    resolve();
                    return;
                }

                const rotation = (elapsed / 1000) * speed * Math.PI * 2;

                els.forEach(item => {
                    const currentAngle = item.angle + rotation;
                    const x = pos.x + Math.cos(currentAngle) * radiusX - size / 2;
                    const y = pos.y + yOffset + Math.sin(currentAngle) * radiusY - size / 2;

                    const depth = Math.sin(currentAngle);
                    const scale = 0.8 + (depth + 1) * 0.2; // 0.8 to 1.2
                    // front is sin > 0
                    item.el.style.left = x + 'px';
                    item.el.style.top = y + 'px';
                    item.el.style.transform = `scale(${scale})`;
                    // Assuming pokemon sprite is around z-index 10
                    item.el.style.zIndex = depth > 0 ? '25' : '5';
                });

                requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        });
    },

    // --- SPRITE METALLIC (Grayscale + Shine Wipe) ---
    async _doSpriteMetallic(step, ctx) {
        const targetName = step.target || 'attacker';
        const sprite = (targetName === 'attacker') ? ctx.attackerSprite : ctx.defenderSprite;
        if (!sprite) return;

        const duration = step.duration || 1000;
        const color = step.color || null; // 'gold', 'bronze', etc.

        // 1. Create Wrapper to hold clone + shine
        // Note: We append to parent.
        const parent = sprite.parentNode;

        // Clone Sprite for the Metallic Base
        const clone = sprite.cloneNode(true);
        // Sync minimal styles
        const computed = window.getComputedStyle(sprite);
        clone.style.position = 'absolute';
        clone.style.left = sprite.style.left || computed.left;
        clone.style.top = sprite.style.top || computed.top;
        clone.style.width = sprite.offsetWidth + 'px';
        clone.style.height = sprite.offsetHeight + 'px';
        clone.style.transform = sprite.style.transform;

        // Apply Metallic Look
        let filter = 'grayscale(100%) contrast(150%) brightness(130%) sepia(10%)';
        if (color === 'gold') {
            filter = 'grayscale(100%) contrast(120%) brightness(130%) sepia(100%) hue-rotate(5deg) saturate(250%)';
        } else if (color === 'bronze') {
            filter = 'grayscale(100%) contrast(120%) brightness(100%) sepia(80%) hue-rotate(-30deg) saturate(150%)';
        }
        clone.style.filter = filter;
        clone.style.zIndex = parseInt(computed.zIndex || 10) + 1;
        clone.style.pointerEvents = 'none';
        clone.style.opacity = '0';
        clone.style.transition = 'opacity 200ms ease-out';
        clone.id = `metallic-base-${Date.now()}`;

        // Create Shine Layer
        const shine = document.createElement('div');
        Object.assign(shine.style, {
            position: 'absolute',
            left: clone.style.left,
            top: clone.style.top,
            width: clone.style.width,
            height: clone.style.height,
            transform: clone.style.transform,
            zIndex: parseInt(clone.style.zIndex) + 1,
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 200ms ease-out'
        });

        // Masking logic
        const spriteUrl = sprite.src;
        const maskImg = `url("${spriteUrl}")`;
        shine.style.webkitMaskImage = maskImg;
        shine.style.maskImage = maskImg;
        shine.style.webkitMaskSize = 'contain';
        shine.style.maskSize = 'contain';
        shine.style.webkitMaskRepeat = 'no-repeat';
        shine.style.maskRepeat = 'no-repeat';
        shine.style.webkitMaskPosition = 'center';
        shine.style.maskPosition = 'center';

        // Shine Gradient
        shine.style.background = 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.8) 45%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.8) 55%, transparent 65%)';
        shine.style.backgroundSize = '250% 100%';
        shine.style.backgroundPosition = '100% 0'; // Start

        parent.appendChild(clone);
        parent.appendChild(shine);

        // Animate
        // Phase 1: Fade In Metallic
        requestAnimationFrame(() => {
            clone.style.opacity = '1';
            shine.style.opacity = '1';
        });

        await wait(200);

        // Phase 2: Swipe Shine
        shine.style.transition = `background-position ${duration * 0.6}ms ease-in-out, opacity 200ms`;
        requestAnimationFrame(() => {
            shine.style.backgroundPosition = '-150% 0';
        });

        await wait(duration);

        // Cleanup
        clone.style.opacity = '0';
        shine.style.opacity = '0';
        await wait(200);
        clone.remove();
        shine.remove();
    }
};
