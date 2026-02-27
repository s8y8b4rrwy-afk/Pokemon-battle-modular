const AIHeuristics = {
    // 1. Type Matchup Scoring
    evaluateTypeMatchup: (move, enemy, player) => {
        // Only give damage bonuses for physical or special moves
        if (move.category === 'status' || (move.power || 0) <= 0) {
            // However, we still want to discourage moves against immune targets!
            let effectiveness = 1;
            if (player.types) {
                player.types.forEach(pType => {
                    if (TYPE_CHART[move.type] && TYPE_CHART[move.type][pType] !== undefined) {
                        effectiveness *= TYPE_CHART[move.type][pType];
                    }
                });
            }
            if (effectiveness === 0) return -100; // Immune 
            return 0; // Neutral if status/low power
        }

        if (!player.types) return 0;

        let effectiveness = 1;
        player.types.forEach(pType => {
            if (TYPE_CHART[move.type] && TYPE_CHART[move.type][pType] !== undefined) {
                effectiveness *= TYPE_CHART[move.type][pType];
            }
        });

        if (effectiveness === 0) return -100; // Immune
        if (effectiveness > 1) return 50;     // Super Effective
        if (effectiveness < 1) return -30;    // Not very effective
        return 0; // Neutral
    },

    // 2. Status Utility Scoring
    evaluateStatusUtility: (move, enemy, player) => {
        const moveLogic = typeof MOVE_LOGIC !== 'undefined' ? MOVE_LOGIC[move.id] : null;
        if (!moveLogic) return 0;

        // Don't use status infliction if player already has a status
        if (moveLogic.status && player.status) {
            return -150; // Vastly discourage
        }

        // Avoid using confusion if player is already confused
        if (moveLogic.volatileStatus === 'confusion' && player.volatiles && player.volatiles.confusion) {
            return -150;
        }

        // If move causes sleep/para/burn/poison, it's generally good if target has no status
        if (moveLogic.status && !player.status) {
            return 30; // Encourage
        }

        return 0;
    },

    // 3. Stat Buff Utility Scoring
    evaluateBuffUtility: (move, enemy, player) => {
        const moveLogic = typeof MOVE_LOGIC !== 'undefined' ? MOVE_LOGIC[move.id] : null;
        if (!moveLogic) return 0;

        // Example: Don't use setup moves if already maxed
        if (moveLogic.target === 'user' && moveLogic.boosts) {
            let alreadyMaxed = true;
            for (const stat in moveLogic.boosts) {
                if (enemy.stages && enemy.stages[stat] < 6) {
                    alreadyMaxed = false;
                }
            }
            if (alreadyMaxed) return -150;
            return 20; // Good idea to setup
        }

        if (moveLogic.boosts && move.target !== 'user') {
            // Stat lowering moves on player
            let alreadyMin = true;
            for (const stat in moveLogic.boosts) {
                // negative boost
                if (player.stages && player.stages[stat] > -6) {
                    alreadyMin = false;
                }
            }
            if (alreadyMin) return -150;
            // Only lower stats if we expect the battle to last a while
            return 10;
        }

        return 0;
    },

    // 4. Expected Damage Calculation
    calculateExpectedDamage: (move, enemy, player) => {
        if (move.power <= 0) return 0;

        // Basic STAB calculation
        let stab = 1;
        if (enemy.types && enemy.types.includes(move.type)) stab = 1.5;

        // Basic Type Matchup for Damage calc
        let effectiveness = 1;
        if (player.types) {
            player.types.forEach(pType => {
                if (TYPE_CHART[move.type] && TYPE_CHART[move.type][pType] !== undefined) {
                    effectiveness *= TYPE_CHART[move.type][pType];
                }
            });
        }

        // Extremely simplified damage estimate
        let baseDmgEstimate = (move.power * stab * effectiveness);

        // If move guarantees a kill, MAX score
        if (baseDmgEstimate > player.currentHp * 1.5) { // Roughly estimate kill threshold
            return 500;
        }

        // Return a proxy score based on damage
        return Math.floor(baseDmgEstimate / 2); // Scale down to fit with other heuristics
    },

    // 5. Memory / Threat Assessment
    evaluateThreats: (move, enemy, player, seenMoves) => {
        let score = 0;
        // Example: If player has used EQ, don't use Dig
        if (move.name === 'DIG' && seenMoves.has('EARTHQUAKE')) {
            score -= 100;
        }
        return score;
    },

    // 6. Predict Healing & Sustain
    evaluateHealing: (move, enemy, player) => {
        const moveLogic = typeof MOVE_LOGIC !== 'undefined' ? MOVE_LOGIC[move.id] : null;
        if (!moveLogic) return 0;

        if (moveLogic.type === 'heal' || moveLogic.heal) {
            let hpPercent = enemy.currentHp / enemy.maxHp;
            if (hpPercent < 0.4) return 150; // Critical, heal up!
            if (hpPercent > 0.8) return -200; // Waste of a turn
            return 50; // Good idea
        }
        return 0;
    },

    // 7. Priority Kill Stealing
    evaluatePriority: (move, enemy, player) => {
        if (move.priority && move.priority > 0) {
            let hpPercent = player.currentHp / player.maxHp;
            // If player is super low, prioritize priority moves to finish them safely
            if (hpPercent < 0.2) return 200;
            return 10; // General priority is nice
        }
        return 0;
    },

    // 8. Weather Synergy
    evaluateWeather: (move, weather) => {
        if (!weather || weather === 'none') return 0;
        let score = 0;
        if (weather === 'sun') {
            if (move.type === 'fire') score += 40;
            if (move.type === 'water') score -= 40;
            if (move.name === 'SOLAR BEAM' || move.name === 'SOLARBEAM') score += 80; // Instant
            if (move.name === 'THUNDER' || move.name === 'HURRICANE') score -= 50; // Reduced accuracy
        } else if (weather === 'rain') {
            if (move.type === 'water') score += 40;
            if (move.type === 'fire') score -= 40;
            if (move.name === 'THUNDER' || move.name === 'HURRICANE') score += 80; // 100% accuracy
            if (move.name === 'SOLAR BEAM' || move.name === 'SOLARBEAM') score -= 50;
        } else if (weather === 'sandstorm') {
            if (move.name === 'SOLAR BEAM' || move.name === 'SOLARBEAM') score -= 50;
        } else if (weather === 'hail') {
            if (move.name === 'BLIZZARD') score += 80;
            if (move.name === 'SOLAR BEAM' || move.name === 'SOLARBEAM') score -= 50;
        }
        return score;
    },

    // 9. Advanced Move Mechanics & Edge Cases
    evaluateAdvancedStrategies: (move, enemy, player) => {
        let score = 0;

        // A. Sleep Dependent Moves (Dream Eater, Snore, Sleep Talk)
        if (move.name === 'DREAM EATER') {
            if (player.status === 'sleep') score += 200; // OP if asleep
            else return -300; // Guaranteed to fail if awake
        }

        if (move.name === 'SNORE' || move.name === 'SLEEP TALK') {
            if (enemy.status === 'sleep') score += 150; // Only usable while asleep
            else return -300; // Fails if awake
        }

        // B. Protect / Detect Spam Prevention
        const logic = typeof MOVE_LOGIC !== 'undefined' ? MOVE_LOGIC[move.id] : null;
        if (logic && logic.type === 'protect') {
            if (enemy.volatiles && enemy.volatiles.protected) {
                return -300; // Don't spam protect twice, usually fails
            }
            score += 20; // Good generic defensive move
        }

        // C. Charging Move Punishes
        if (player.volatiles && player.volatiles.charging) {
            if (logic && logic.type === 'protect') {
                score += 150; // Use protect when opponent is charging!
            }
            // For example, if player is flying/digging, Earthquake/Thunder might hit
            if (player.volatiles.invulnerable === 'digging' && move.name === 'EARTHQUAKE') score += 100;
            if (player.volatiles.invulnerable === 'flying' && move.name === 'THUNDER') score += 100;
        }

        // D. Flinch Maximization (If we are faster, Flinch moves are way better)
        if (logic && logic.secondary && logic.secondary.volatileStatus === 'flinch') {
            let eSpe = enemy.stats ? enemy.stats.spe : 1;
            let pSpe = player.stats ? player.stats.spe : 1;
            if (enemy.stages && enemy.stages.spe) eSpe *= (enemy.stages.spe > 0 ? (2 + enemy.stages.spe) / 2 : 2 / (2 - enemy.stages.spe));
            if (player.stages && player.stages.spe) pSpe *= (player.stages.spe > 0 ? (2 + player.stages.spe) / 2 : 2 / (2 - player.stages.spe));

            if (eSpe > pSpe) score += 30; // Extra points for flinch moves if faster
        }

        // E. Explosion / Self-Destruct
        if (move.name === 'EXPLOSION' || move.name === 'SELF-DESTRUCT' || move.name === 'SELF DESTRUCT') {
            let hpPercent = enemy.currentHp / enemy.maxHp;
            if (hpPercent < 0.25) score += 100; // Take them down with you
            else score -= 100; // Don't blow up at full HP
        }

        // F. Leech Seed Checks
        if (move.name === 'LEECH SEED') {
            if (player.types && player.types.includes('grass')) return -300; // Immune
            if (player.volatiles && player.volatiles.leechSeed) return -300; // Already seeded
            score += 40; // Otherwise, great move
        }

        // G. Recharge Moves (Hyper Beam)
        if (logic && logic.recharge) {
            // These moves force you to lose a turn. ONLY use them if they are a guaranteed kill
            const estDamage = AIHeuristics.calculateExpectedDamage(move, enemy, player);
            if (estDamage < player.currentHp * 1.2) {
                // If it probably won't secure the kill, massively penalize
                score -= 150;
            } else {
                score += 50; // Worth it for the secure
            }
        }

        // H. Hazards (Spikes, Stealth Rock)
        if (logic && logic.sideCondition) {
            const sideConditions = typeof Battle !== 'undefined' ? Battle.sideConditions : { player: {} };
            if (sideConditions.player && sideConditions.player[logic.sideCondition]) {
                return -300; // Already set up
            }
            score += 60; // Set them up!
        }

        // I. Substitute
        if (move.name === 'SUBSTITUTE') {
            if (enemy.volatiles && enemy.volatiles.substituteHP > 0) return -300; // Already have one
            if (enemy.currentHp <= enemy.maxHp * 0.25) return -300; // Not enough HP
            score += 40;
        }

        // J. Barriers
        if (move.name === 'REFLECT' || move.name === 'LIGHT SCREEN' || move.name === 'AURORA VEIL') {
            const sideConditions = typeof Battle !== 'undefined' && EnvironmentManager ? EnvironmentManager.sideConditions : { enemy: {} };
            const conds = sideConditions.enemy || {};
            if (move.name === 'REFLECT' && conds.reflect > 0) return -300;
            if (move.name === 'LIGHT SCREEN' && conds.lightScreen > 0) return -300;
            if (move.name === 'AURORA VEIL' && conds.auroraVeil > 0) return -300;

            if (move.name === 'AURORA VEIL') {
                const weather = typeof EnvironmentManager !== 'undefined' && EnvironmentManager.weather ? EnvironmentManager.weather.type : 'none';
                if (weather !== 'hail' && weather !== 'snow') return -300;
            }
            score += 50;
        }

        return score;
    }
};

const BattleAI = {
    /**
     * Decisions which move the enemy should use.
     * @param {Object} enemy - The enemy Pokemon instance.
     * @param {Object} player - The player Pokemon instance.
     * @param {Set} seenMoves - Set of move names the player has used.
     * @returns {Object} The chosen move.
     */
    chooseMove(enemy, player, seenMoves = new Set()) {
        const aiLevel = enemy.aiLevel || 50;
        const weather = typeof Battle !== 'undefined' && Battle.weather ? Battle.weather.type : 'none';

        // 1. Forced Actions (Recharging/Charging)
        if (enemy.volatiles.recharging) {
            return { name: "Recharging", priority: 0 };
        }
        if (enemy.volatiles.charging && enemy.volatiles.queuedMove) {
            return enemy.volatiles.queuedMove;
        }
        if (enemy.volatiles.encored) {
            return enemy.volatiles.encored.move;
        }
        if (enemy.volatiles.lockIn) {
            return enemy.volatiles.lockIn.move;
        }

        // 2. Base Move Selection
        if (!enemy.moves || enemy.moves.length === 0) {
            return { name: "STRUGGLE", type: "normal", power: 50, accuracy: 100, priority: 0 };
        }

        // 3. Filter Disabled Moves
        let availableMoves = enemy.moves;
        if (enemy.volatiles.disabled) {
            availableMoves = availableMoves.filter(m => m.name !== enemy.volatiles.disabled.moveName);
        }

        // 4. Fallback to Struggle if all moves are disabled
        if (availableMoves.length === 0) {
            return { name: "STRUGGLE", type: "normal", power: 50, accuracy: 100, priority: 0 };
        }

        // 5. Smart Evaluation
        let scoredMoves = availableMoves.map(move => {
            let score = 100; // Base baseline score

            // Tier 1 Intel (Low IQ ~ 20+): Basic Type Matchups
            if (aiLevel >= 20) {
                score += AIHeuristics.evaluateTypeMatchup(move, enemy, player);
            }

            // Tier 2 Intel (Med IQ ~ 50+): Status and Buff awareness
            if (aiLevel >= 50) {
                score += AIHeuristics.evaluateStatusUtility(move, enemy, player);
                score += AIHeuristics.evaluateBuffUtility(move, enemy, player);
                score += AIHeuristics.evaluateHealing(move, enemy, player);
            }

            // Tier 3 Intel (High IQ ~ 70+): Memory
            if (aiLevel >= 70) {
                if (seenMoves && seenMoves.size > 0) {
                    score += AIHeuristics.evaluateThreats(move, enemy, player, seenMoves);
                }
                score += AIHeuristics.evaluateWeather(move, weather);
            }

            // Tier 4 Intel (Boss IQ ~ 80+): Damage estimation + kill secures
            if (aiLevel >= 80) {
                score += AIHeuristics.calculateExpectedDamage(move, enemy, player);
                score += AIHeuristics.evaluatePriority(move, enemy, player);
                score += AIHeuristics.evaluateAdvancedStrategies(move, enemy, player);
            }

            // Randomness factor inversely proportional to IQ. 
            // 0 IQ = 100 Max Randomness. 100 IQ = 0 Randomness.
            let maxRandom = Math.max(20, 120 - aiLevel);
            score += Math.random() * maxRandom;

            return { move, score };
        });

        // Filter out moves that are explicitly deemed terrible (score <= 0) unless it's the only option
        let viableMoves = scoredMoves.filter(x => x.score > 0);
        if (viableMoves.length === 0) viableMoves = scoredMoves; // Fallback

        // Sort by highest score
        viableMoves.sort((a, b) => b.score - a.score);

        // 6. Probabilistic Selection (Variety)
        // Instead of always picking the absolute best, we use a temperature-based softmax.
        // This ensures the AI "tries" other moves occasionally, even at high IQs.
        const maxScore = viableMoves[0].score;

        // Temperature scales with IQ. 
        // 0 IQ -> Temp 50 (Very random choice)
        // 100 IQ -> Temp 10 (Very likely to pick best)
        const temperature = Math.max(5, (110 - aiLevel) / 2);

        const weights = viableMoves.map(x => Math.exp((x.score - maxScore) / temperature));
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);

        let randomVal = Math.random() * totalWeight;
        for (let i = 0; i < viableMoves.length; i++) {
            randomVal -= weights[i];
            if (randomVal <= 0) return viableMoves[i].move;
        }

        return viableMoves[0].move;
    }
};
