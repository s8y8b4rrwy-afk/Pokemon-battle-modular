/**
 * @typedef {Object} StatBlock
 * @property {number} hp
 * @property {number} atk
 * @property {number} def
 * @property {number} spa
 * @property {number} spd
 * @property {number} spe
 */

/**
 * @typedef {Object} StageBlock
 * @property {number} atk
 * @property {number} def
 * @property {number} spa
 * @property {number} spd
 * @property {number} spe
 * @property {number} acc
 * @property {number} eva
 */

/**
 * @typedef {Object} Move
 * @property {string} name
 * @property {string} id
 * @property {string} type
 * @property {number} power
 * @property {number} accuracy
 * @property {string} category 'physical' | 'special' | 'status'
 * @property {number} priority
 * @property {number} pp
 * @property {number} max_pp
 * @property {Object} meta
 * @property {Array} stat_changes
 * @property {string} target
 * @property {number} [stat_chance]
 * @property {number} [min_hits]
 * @property {number} [max_hits]
 * @property {boolean} [skipAnim]
 */

/**
 * @typedef {Object} Volatiles
 * @property {number} [confused] Turns remaining
 * @property {number} [sleepTurns] Turns remaining
 * @property {boolean} [flinched]
 * @property {boolean} [recharging]
 * @property {Object} [disabled]
 * @property {string} disabled.moveName
 * @property {number} disabled.turns
 * @property {number} [substituteHP]
 * @property {string} [originalSprite]
 * @property {boolean} [destinyBond]
 * @property {number} [perishCount]
 * @property {boolean} [cursed]
 * @property {Object} [trapped]
 * @property {number} trapped.turns
 * @property {string} trapped.source
 * @property {string} trapped.moveName
 * @property {Object} [seeded]
 * @property {string} seeded.source
 * @property {number} [turnDamage]
 * @property {string} [turnDamageCategory]
 * @property {boolean} [transformed]
 * @property {boolean} [minimized]
 * @property {boolean} [identified]
 * @property {boolean} [nightmare]
 * @property {boolean} [attract]
 * @property {boolean} [focusEnergy]
 * @property {number} [toxicCounter]
 * @property {number} [drowsy]
 * @property {Object} [encored]
 * @property {Move} encored.move
 * @property {number} encored.turns
 * @property {Object} [lockIn]
 * @property {Move} lockIn.move
 * @property {number} lockIn.turns
 * @property {any} [index]
 */

/**
 * @typedef {Object} AnimStep
 * @property {'sfx'|'cry'|'wait'|'screenFx'|'spriteShake'|'cssClass'|'move'|'spawn'|'particles'|'beam'|'stream'|'volley'|'flash'|'overlay'|'formation'|'spriteMove'|'tilt'|'bgColor'|'invert'|'spriteSilhouette'|'spriteGhost'|'wave'|'spriteWave'|'orbit'|'spriteMetallic'|'callback'|'parallel'} type
 * @property {string} [sound] For 'sfx'
 * @property {string} [cry] For 'cry'
 * @property {number} [ms] For 'wait'
 * @property {string} [class] For 'screenFx', 'cssClass'
 * @property {number} [duration]
 * @property {string} [target] 'attacker'|'defender'|'scene'|'fxContainer'
 * @property {string} [el] For 'cssClass', 'move'
 * @property {string} [selector] For 'cssClass', 'move'
 * @property {number} [x]
 * @property {number} [y]
 * @property {string} [easing]
 * @property {boolean} [reset]
 * @property {string} [tag] For 'spawn'
 * @property {string} [className]
 * @property {Object} [styles]
 * @property {string} [text]
 * @property {string} [parent]
 * @property {number} [waitAfter]
 * @property {number} [count]
 * @property {number} [spread]
 * @property {Object} [particleStyles]
 * @property {string|Object} [position]
 * @property {string|Object} [from]
 * @property {string|Object} [to]
 * @property {number} [width]
 * @property {number} [height]
 * @property {Object} [beamStyles]
 * @property {string} [color]
 * @property {number} [opacity]
 * @property {number} [interval]
 * @property {number} [travelTime]
 * @property {number} [size]
 * @property {string} [outline]
 * @property {boolean} [fade]
 * @property {number} [scaleStart]
 * @property {number} [scaleEnd]
 * @property {string} [svgShape]
 * @property {Object} [projectile]
 * @property {string} [shape]
 * @property {string} [animation]
 * @property {string} [pattern]
 * @property {Array} [points]
 * @property {number} [particleSize]
 * @property {number} [stagger]
 * @property {'lunge'|'dodge'|'jump'|'recoil'|'charge'|'slam'|'float'|'shake'} [preset]
 * @property {number} [angle]
 * @property {number} [intensity]
 * @property {number} [speed]
 * @property {Function} [fn]
 * @property {AnimStep[]} [steps] For 'parallel'
 * @property {number} [hold] For 'spriteSilhouette'
 * @property {boolean} [follow] For 'spriteSilhouette'
 * @property {any} [index]
 */

/**
 * @typedef {Object} AnimationEngine
 * @property {Function} register
 * @property {Function} has
 * @property {Function} list
 * @property {Function} play
 * @property {Object} [_registry]
 * @property {Function} [_executeStep]
 * @property {Function} [_resolveContext]
 * @property {Function} [_resolveElement]
 * @property {Function} [_resolvePosition]
 * @property {Object} [_shapes]
 * @property {Object} [_formations]
 * @property {Function} [_doScreenFx]
 * @property {Function} [_doSpriteShake]
 * @property {Function} [_doMove]
 * @property {Function} [_doSpawn]
 * @property {Function} [_doParticles]
 * @property {Function} [_doBeam]
 * @property {Function} [_doStream]
 * @property {Function} [_doVolley]
 * @property {Function} [_doFlash]
 * @property {Function} [_doOverlay]
 * @property {Function} [_doFormation]
 * @property {Function} [_doSpriteMove]
 * @property {Function} [_doTilt]
 * @property {Function} [_doBgColor]
 * @property {Function} [_doInvert]
 * @property {Function} [_doSpriteSilhouette]
 * @property {Function} [_doSpriteGhost]
 * @property {Function} [_ensureSilhouetteFilter]
 * @property {Function} [_doWave]
 * @property {Function} [_doSpriteWave]
 * @property {Function} [_doSpriteWave]
 * @property {Function} [_doOrbit]
 * @property {Function} [_doSpriteMetallic]
 * @property {Function} [_createShapeEl]
 * @property {Function} [_getMovePreset]
 * @property {any} [x]
 */

/**
 * @typedef {Object} Pokemon
 * @property {number} id
 * @property {string} name
 * @property {number} level
 * @property {number} maxHp
 * @property {number} currentHp
 * @property {StatBlock} stats
 * @property {StatBlock} baseStats
 * @property {number} exp
 * @property {number} nextLvlExp
 * @property {number} baseExp
 * @property {string|null} status 'par' | 'brn' | 'psn' | 'frz' | 'slp' | null
 * @property {Volatiles} volatiles
 * @property {StageBlock} stages
 * @property {string[]} types
 * @property {Move[]} moves
 * @property {boolean} isShiny
 * @property {string} frontSprite
 * @property {string} backSprite
 * @property {string} icon
 * @property {string|null} cry
 * @property {boolean} isBoss
 * @property {number} failedCatches
 * @property {number} rageLevel
 * @property {boolean} isHighTier
 * @property {Move} [lastMoveUsed]
 * @property {Object} [transformBackup]
 */

/**
 * @typedef {Object} BattleEngine
 * @property {Pokemon} p Player Pokemon
 * @property {Pokemon} e Enemy Pokemon
 * @property {boolean} uiLocked
 * @property {Set} participants
 * @property {any} userInputPromise
 * @property {Object} weather
 * @property {string} weather.type 'none' | 'sun' | 'rain' | 'sand' | 'hail'
 * @property {number} weather.turns
 * @property {Object} sideConditions
 * @property {{spikes: number}} sideConditions.player
 * @property {{spikes: number}} sideConditions.enemy
 * @property {Array} [delayedMoves]
 * @property {boolean} [batonPassActive]
 * @property {Function} executeDamagePhase
 * @property {Function} handleDamageSequence
 * @property {Function} applyDamage
 * @property {Function} applyHeal
 * @property {Function} setWeather
 * @property {Function} applyStatChanges
 * @property {Function} processSwitch
 * @property {Function} resetScene
 * @property {Function} cleanup
 * @property {Function} triggerHitAnim
 * @property {Function} triggerHealAnim
 * @property {Function} performVisualSwap
 * @property {Function} triggerRageAnim
 * @property {Function} animateSwap
 * @property {Function} resetSprite
 * @property {Function} forceReflow
 * @property {Function} uiToMoves
 * @property {Function} uiToMenu
 * @property {Function} askRun
 * @property {Function} openPack
 * @property {Function} renderPackList
 * @property {Function} buildMoveMenu
 * @property {Function} _playEffectivenessSfx
 * @property {Function} _flashSprite
 * @property {Function} setup
 * @property {Function} startEncounterSequence
 * @property {Function} triggerPlayerEntry
 * @property {Function} endTurnItem
 * @property {Function} runQueue
 * @property {Function} executeAction
 * @property {Function} processAttack
 * @property {Function} processSwitch
 * @property {Function} checkCanMove
 * @property {Function} processEndTurnEffects
 * @property {Function} applyStatChanges
 * @property {Function} applyStatus
 * @property {Function} processDelayedMoves
 * @property {Function} revertTransform
 * @property {Function} performTurn
 * @property {Function} performSwitch
 * @property {Function} performItem
 * @property {Function} performRun
 * @property {Function} processItem
 * @property {Function} executeDamagePhase
 * @property {Function} handleDamageSequence
 * @property {Function} resolveSingleHit
 * @property {Function} handleAttackerRage
 * @property {Function} handleStatusMove
 * @property {Function} handleMoveSideEffects
 * @property {Function} playSparkle
 * @property {Function} switchIn
 * @property {number} lastMenuIndex
 * @property {any} [x]
 */

/**
 * @typedef {Object} MoveEntry
 * @property {boolean} [isUnique]
 * @property {(battle: BattleEngine, user: Pokemon, target: Pokemon, weatherMod?: number) => Promise<any>} [onHit]
 * @property {number} [fixedDamage]
 * @property {(u: Pokemon, t: Pokemon) => number} [damageCallback]
 * @property {boolean} [ohko]
 * @property {(t: Pokemon) => boolean} [condition]
 */

/**
 * @typedef {Object} ItemEntry
 * @property {string} name
 * @property {number} [heal]
 * @property {string} type 'heal' | 'ball' | 'revive' | 'status_heal' | 'buff'
 * @property {string} desc
 * @property {string} img
 * @property {number} [rate]
 * @property {string} [css]
 * @property {string} [condition]
 * @property {string} [stat]
 * @property {number} [val]
 */

/**
 * @typedef {Object} DialogManager
 * @property {Array} queue
 * @property {boolean} isTyping
 * @property {(text: string, options?: Object) => Promise<void>} show
 * @property {(text: string, choices?: string[], options?: Object) => Promise<string>} ask
 * @property {(choices: string[]) => void} renderChoices
 * @property {() => void} hideChoices
 * @property {() => void} processQueue
 * @property {(key: string) => boolean} handleInput
 */
