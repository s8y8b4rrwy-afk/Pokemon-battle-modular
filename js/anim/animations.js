// ============================================================
// BATTLE ANIMS — High-Level Animation API
// ============================================================
// This module is the public API that the rest of the codebase
// calls. It delegates to AnimFramework when a registered
// animation exists, and falls back to inline logic for
// core sequences (entry, swap, faint) that need tight control.
// ============================================================

const BattleAnims = {

    // --- CORE HIT ANIMATION ---
    // Used by the damage pipeline. Checks framework first,
    // then falls back to the classic inline behavior.
    // Priority: move-specific animation → type-based fx → inline fallback
    async triggerHitAnim(target, moveType = 'normal', moveName = null) {
        const isPlayer = (target === Battle.p);
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');
        const isInvisible = !!target.volatiles.invulnerable;

        const ctx = {
            attacker: isPlayer ? Battle.e : Battle.p,
            defender: target,
            isPlayerAttacker: !isPlayer
        };

        // 1. Try move-specific animation (e.g. 'flamethrower', 'ice-beam')
        if (moveName) {
            const registryKey = moveName.toLowerCase().replace(/\s+/g, '-');
            if (AnimFramework.has(registryKey)) {
                await AnimFramework.play(registryKey, ctx);
                return;
            }
        }

        // 2. Try type-based fx animation (e.g. 'fx-fire')
        const fxName = `fx-${moveType}`;
        if (AnimFramework.has(fxName)) {
            await AnimFramework.play(fxName, ctx);
            return;
        }

        // 3. Fallback: Classic inline behavior
        const sfx = (moveType === 'paralysis') ? 'electric' : moveType;
        AudioEngine.playSfx(sfx);

        if (['fire', 'water', 'ice', 'grass', 'electric', 'psychic'].includes(moveType)) {
            const scene = document.getElementById('scene');
            scene.classList.remove(`fx-${moveType}`);
            UI.forceReflow(scene);
            scene.classList.add(`fx-${moveType}`);
            setTimeout(() => scene.classList.remove(`fx-${moveType}`), 600);
        }

        if (!isInvisible) {
            const isFlipped = sprite.classList.contains('sub-back');
            const hitClass = isFlipped ? 'anim-hit-flipped' : 'anim-hit';

            sprite.classList.remove('anim-hit', 'anim-hit-flipped');
            UI.forceReflow(sprite);
            sprite.classList.add(hitClass);

            await wait(400);
            sprite.classList.remove(hitClass);
        } else {
            await wait(200);
        }
    },

    // --- EXPLOSION ---
    async triggerExplosionAnim() {
        if (AnimFramework.has('explosion')) {
            await AnimFramework.play('explosion', {});
            return;
        }

        // Fallback
        const scene = document.getElementById('scene');
        const fxLayer = document.getElementById('fx-container');

        const flash = document.createElement('div');
        flash.className = 'explosion-flash';
        fxLayer.appendChild(flash);

        AudioEngine.playSfx('explosion');
        scene.classList.add('fx-explosion');

        await wait(800);

        scene.classList.remove('fx-explosion');
        flash.remove();
    },

    // --- VISUAL SWAP (Send out / Substitute) ---
    async performVisualSwap(mon, targetSrc, isDoll, isPlayerOverride = null) {
        const isPlayer = (isPlayerOverride !== null) ? isPlayerOverride : (mon === Battle.p);
        const sprite = isPlayer ? document.getElementById('player-sprite') : document.getElementById('enemy-sprite');

        const x = isPlayer ? 60 : 230;
        const y = isPlayer ? 150 : 70;

        AudioEngine.playSfx('ball');
        UI.spawnSmoke(x, y);

        sprite.style.opacity = 0;
        await wait(100);

        sprite.src = targetSrc;

        if (isPlayer && isDoll) sprite.classList.add('sub-back');
        else sprite.classList.remove('sub-back');

        sprite.style.opacity = 1;

        sprite.classList.remove('anim-enter');
        UI.forceReflow(sprite);
        sprite.classList.add('anim-enter');

        setTimeout(() => {
            sprite.classList.remove('anim-enter');
        }, 600);

        await wait(200);
    },

    // --- RAGE ANIMATION ---
    async triggerRageAnim(cry) {
        if (AnimFramework.has('rage-buildup')) {
            if (cry) AudioEngine.playCry(cry);
            await AnimFramework.play('rage-buildup', {});
            return;
        }

        // Fallback
        document.getElementById('scene').classList.add('anim-violent');
        if (cry) AudioEngine.playCry(cry);
        AudioEngine.playSfx('rumble');
        await wait(500);
        document.getElementById('scene').classList.remove('anim-violent');
    },

    // --- SWITCH ANIMATION ---
    async animateSwap(oldMon, newMon, cb) {
        const sprite = document.getElementById('player-sprite');
        AudioEngine.playSfx('ball');
        sprite.classList.add('anim-return');
        await wait(400);
        sprite.src = newMon.backSprite;
        sprite.classList.remove('anim-return');
        sprite.classList.add('anim-enter');
        AudioEngine.playSfx('ball');
        UI.spawnSmoke(60, 150);
        if (newMon.cry) AudioEngine.playCry(newMon.cry);
        await wait(600);
        sprite.classList.remove('anim-enter');
        if (cb) cb();
    },

    // --- FRAMEWORK BRIDGE ---
    // Play any registered animation by name.
    // This is the preferred entry point for new code.
    async playRegistered(name, ctx) {
        return AnimFramework.play(name, ctx);
    }
};
