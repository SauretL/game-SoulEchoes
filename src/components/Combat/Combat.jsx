import React, { useState, useEffect } from 'react'
import './Combat.css'
import {
    getAlivePlayersCount as getAlivePlayersCountLogic,
    getHpPercentage,
    initializeCombatState,
    addToBattleLog,
    getLastBattleLogs,
    handleEndPlayerTurn,
    executeEnemyTurn,
    executePlayerAttack,
    executePlayerPositionSwap,
    getBattleReward,
    getBattlePenalty,
    areAllEnemiesDefeated,
    canSelectAttackType,
    isEnemyTargetable,
    createTargetingMessage,
    getAllSpecialAttacks,
    getAllBasicAttacks,
    getAttackById,
    processCharacterStartOfTurn,
    processCharacterEndOfTurn,
    handleConfusedTurn,
    getStatusEffectDisplayInfo,
    createStatusEffectMessage,
    findNextAlivePlayer
} from '../../utils/combatLogic'
import { applyStatusEffect } from '../../utils/statusEffects'
import CharacterDetail from '../CharacterDetail/CharacterDetail'

const Combat = ({
    activeCharacters,
    enemy,
    onCombatEnd,
    onCoinUpdate,
    onResetDungeon,
    playerCharactersHp,
    playerMaxHp,
    onCharacterHpChange,
    onResetCharacterHp
}) => {

    // ========== STATE MANAGEMENT ==========
    const [combatState, setCombatState] = useState(() => {
        const enemiesArray = Array.isArray(enemy) ? enemy : [enemy]
        return initializeCombatState(activeCharacters, enemiesArray, playerCharactersHp, playerMaxHp)
    })

    const [combatPositions, setCombatPositions] = useState({
        front: [null, null, null],
        back: [null, null, null]
    })

    const [selectedCharacter, setSelectedCharacter] = useState(null)
    const [selectedAttackType, setSelectedAttackType] = useState(null)
    const [selectedSpecialAttack, setSelectedSpecialAttack] = useState(null)
    const [targetingMode, setTargetingMode] = useState(false)

    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null })
    const [keywordTooltip, setKeywordTooltip] = useState({ visible: false, x: 0, y: 0, content: null })


    // ========== INITIALIZE COMBAT POSITIONS ==========
    useEffect(() => {
        setCombatPositions(activeCharacters)
    }, [activeCharacters])

    // ========== BATTLE LOG HELPER ==========
    const addLog = (message) => {
        setCombatState(prev => ({
            ...prev,
            battleLog: addToBattleLog(prev.battleLog, message)
        }))
    }

    // ========== ENEMY TURN AUTOMATION ==========
    useEffect(() => {
        if (combatState.currentTurn === 'enemy' && combatState.battleStatus === 'ongoing') {
            const timer = setTimeout(() => {
                enemyTurn()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [combatState.currentTurn, combatState.battleStatus])

    // ========== GETTERS ==========
    const getCurrentPlayerTurn = () => {
        const currentPlayer = combatState.playerCharacters[combatState.currentPlayerTurnIndex]

        // If current player is dead, skip to next alive player
        if (currentPlayer && currentPlayer.currentHp <= 0) {
            const nextAliveIndex = findNextAlivePlayer(combatState.playerCharacters, combatState.currentPlayerTurnIndex)
            if (nextAliveIndex !== -1 && nextAliveIndex !== combatState.currentPlayerTurnIndex) {
                // Update to next alive player
                setTimeout(() => {
                    setCombatState(prev => ({
                        ...prev,
                        currentPlayerTurnIndex: nextAliveIndex
                    }))
                }, 100)
            }
        }

        return currentPlayer
    }

    const getAlivePlayersCount = () => {
        return getAlivePlayersCountLogic(combatState.playerCharacters)
    }

    const getAliveEnemiesCount = () => {
        return combatState.enemies.filter(enemy => enemy.currentHp > 0 && enemy.isAlive).length
    }

    // ========== STATUS EFFECT DISPLAY ==========
    const getStatusEffectsForCharacter = (character) => {
        if (!character || !character.statusEffects) return []
        return getStatusEffectDisplayInfo(character.statusEffects)
    }

    const getStatusEffectIcon = (statusType) => {
        const icons = {
            'bleeding': '🩸',
            'confusion': '🌀',
            'trauma': '🧠',
            'weakened': '💢'
        }
        return icons[statusType] || '⚡'
    }

    const getStatusEffectColor = (statusType) => {
        const colors = {
            'bleeding': '#ff4444',
            'confusion': '#aa44ff',
            'trauma': '#666666',
            'weakened': '#ffaa44'
        }
        return colors[statusType] || '#ffffff'
    }

    // ========== CHARACTER CLICK HANDLER ==========
    const handleCharacterClick = (character) => {
        if (combatState.battleStatus === 'ongoing' && !targetingMode) {
            setSelectedCharacter(character)
        }
    }

    const closeCharacterDetail = () => {
        setSelectedCharacter(null)
    }

    // ========== ATTACK TYPE SELECTION ==========
    const handleSelectAttackType = (attackType) => {
        const currentPlayer = getCurrentPlayerTurn()

        if (!canSelectAttackType(combatState.currentTurn, combatState.battleStatus, currentPlayer)) {
            return
        }

        setSelectedAttackType(attackType)
        setSelectedSpecialAttack(null)
        setTargetingMode(true)

        addLog(createTargetingMessage(attackType))
    }

    // ========== SPECIAL ATTACK SELECTION ==========
    const handleSelectSpecialAttack = (specialAttackId) => {
        const currentPlayer = getCurrentPlayerTurn()

        if (!canSelectAttackType(combatState.currentTurn, combatState.battleStatus, currentPlayer)) {
            return
        }

        const attack = getAttackById(specialAttackId)
        if (!attack) return

        setSelectedSpecialAttack(specialAttackId)
        setSelectedAttackType(attack.type)
        setTargetingMode(true)

        addLog(`🎯 ${attack.name} seleccionado - Haz clic en un enemigo para atacar`)
    }

    // ========== ENEMY TARGET SELECTION ==========
    const handleEnemyClick = (enemy) => {
        if (!targetingMode || (!selectedAttackType && !selectedSpecialAttack)) {
            return
        }
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') {
            return
        }

        if (!isEnemyTargetable(enemy)) {
            return
        }

        if (selectedSpecialAttack) {
            executeAttack(selectedAttackType, enemy, true, selectedSpecialAttack)
        } else {
            executeAttack(selectedAttackType, enemy)
        }

        setTargetingMode(false)
        setSelectedAttackType(null)
        setSelectedSpecialAttack(null)
    }

    // ========== CANCEL TARGETING ==========
    const handleCancelTargeting = () => {
        setTargetingMode(false)
        setSelectedAttackType(null)
        setSelectedSpecialAttack(null)
        addLog("❌ Selección de ataque cancelada")
    }

    // ========== POSITION SWAP ACTION ==========
    const handlePositionSwap = () => {
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') return
        if (targetingMode) {
            addLog("⚠️ Cancela la selección de ataque primero")
            return
        }

        const currentPlayer = getCurrentPlayerTurn()
        if (!currentPlayer || currentPlayer.currentHp <= 0) return

        const swapResult = executePlayerPositionSwap(combatPositions, currentPlayer)

        if (!swapResult.success) {
            addLog(swapResult.message)
            return
        }

        setCombatPositions(swapResult.newPositions)
        addLog(swapResult.logMessage)
        endPlayerTurn()
    }

    // ========== PLAYER ATTACK EXECUTION ==========
    const executeAttack = (attackType, targetEnemy, isSpecial = false, specialAttackType = null) => {
        const currentPlayer = getCurrentPlayerTurn()
        if (!currentPlayer || currentPlayer.currentHp <= 0) {
            // Skip to next player if current is dead
            endPlayerTurn()
            return
        }

        // Process start of turn status effects (bleeding, confusion)
        const startOfTurnEffects = processCharacterStartOfTurn(currentPlayer)
        if (startOfTurnEffects.damage > 0) {
            startOfTurnEffects.messages.forEach(msg => addLog(msg.message))

            // Apply bleeding damage
            const updatedHp = Math.max(0, currentPlayer.currentHp - startOfTurnEffects.damage)
            const updatedPlayers = combatState.playerCharacters.map(char =>
                char.id === currentPlayer.id ? { ...char, currentHp: updatedHp } : char
            )

            setCombatState(prev => ({ ...prev, playerCharacters: updatedPlayers }))

            if (typeof onCharacterHpChange === 'function') {
                onCharacterHpChange(currentPlayer.id, updatedHp)
            }

            // Check if player dies from bleeding
            if (updatedHp <= 0) {
                addLog(`💀 ${currentPlayer.name} muere por Sangrado`)
                endPlayerTurn()
                return
            }
        }

        // Handle confusion
        if (startOfTurnEffects.isConfused) {
            const confusionResult = handleConfusedTurn(currentPlayer, combatState.playerCharacters)
            addLog(confusionResult.message)

            if (confusionResult.success) {
                // Apply confusion attack to ally
                const updatedPlayers = combatState.playerCharacters.map(char =>
                    char.id === confusionResult.target.id
                        ? { ...char, currentHp: Math.max(0, char.currentHp - confusionResult.attackResult.damage) }
                        : char
                )

                setCombatState(prev => ({ ...prev, playerCharacters: updatedPlayers }))

                if (typeof onCharacterHpChange === 'function') {
                    onCharacterHpChange(confusionResult.target.id, Math.max(0, confusionResult.target.currentHp - confusionResult.attackResult.damage))
                }

                addLog(`${confusionResult.target.name} recibe ${confusionResult.attackResult.damage} de daño`)
            }

            processCharacterEndOfTurn(currentPlayer)
            endPlayerTurn()
            return
        }

        // Normal attack execution
        const attackResult = executePlayerAttack(combatState, attackType, targetEnemy, isSpecial, specialAttackType)

        if (attackResult.shouldSkipTurn) {
            endPlayerTurn()
            return
        }

        // Add log message
        addLog(attackResult.logMessage)

        // Update enemy HP and apply status effects
        const updatedEnemies = combatState.enemies.map(enemy => {
            if (enemy.id === targetEnemy.id) {
                const totalDamage = attackResult.totalDamage || attackResult.damage
                const updatedEnemy = {
                    ...enemy,
                    currentHp: Math.max(0, enemy.currentHp - totalDamage),
                    isAlive: (enemy.currentHp - totalDamage) > 0
                }

                // Apply status effects to the enemy
                if (attackResult.statusApplied && attackResult.appliedStatuses) {
                    attackResult.appliedStatuses.forEach(status => {
                        applyStatusEffect(updatedEnemy, status.type, status.stacks, currentPlayer.id)
                    })
                }

                return updatedEnemy
            }
            return enemy
        })

        // Process end of turn status effects
        processCharacterEndOfTurn(currentPlayer)

        if (areAllEnemiesDefeated(updatedEnemies)) {
            setCombatState(prev => ({ ...prev, enemies: updatedEnemies }))
            endBattle('victory')
        } else {
            setCombatState(prev => ({ ...prev, enemies: updatedEnemies }))
            endPlayerTurn()
        }
    }

    // ========== END PLAYER TURN ==========
    const endPlayerTurn = () => {
        const turnResult = handleEndPlayerTurn(combatState)

        if (turnResult.shouldEndBattle) {
            endBattle(turnResult.result)
            return
        }

        setCombatState(prev => ({
            ...prev,
            ...turnResult.newState
        }))
    }

    // ========== ENEMY TURN ==========
    const enemyTurn = () => {
        let allLogMessages = []
        let updatedPlayers = [...combatState.playerCharacters]
        let updatedEnemies = [...combatState.enemies]

        combatState.enemies.forEach((enemy, enemyIndex) => {
            if (enemy.currentHp <= 0 || !enemy.isAlive) {
                return
            }

            // Process enemy start of turn status effects
            const enemyStartEffects = processCharacterStartOfTurn(enemy)
            if (enemyStartEffects.damage > 0) {
                enemyStartEffects.messages.forEach(msg => allLogMessages.push(msg.message))

                const updatedEnemyHp = Math.max(0, enemy.currentHp - enemyStartEffects.damage)
                updatedEnemies = updatedEnemies.map(e =>
                    e.id === enemy.id
                        ? { ...e, currentHp: updatedEnemyHp, isAlive: updatedEnemyHp > 0 }
                        : e
                )

                if (updatedEnemyHp <= 0) {
                    allLogMessages.push(`💀 ${enemy.name} muere por Sangrado`)
                    return // Skip attack if enemy dies from bleeding
                }
            }

            // Handle confused enemy
            if (enemyStartEffects.isConfused) {
                const confusionResult = handleConfusedTurn(enemy, combatState.enemies)
                allLogMessages.push(confusionResult.message)

                if (confusionResult.success) {
                    // Apply confusion attack to another enemy
                    updatedEnemies = updatedEnemies.map(e =>
                        e.id === confusionResult.target.id
                            ? { ...e, currentHp: Math.max(0, e.currentHp - confusionResult.attackResult.damage) }
                            : e
                    )
                    allLogMessages.push(`${confusionResult.target.name} recibe ${confusionResult.attackResult.damage} de daño`)
                }

                processCharacterEndOfTurn(enemy)
                return
            }

            const enemyResult = executeEnemyTurn(
                { ...combatState, playerCharacters: updatedPlayers, enemies: updatedEnemies },
                enemy
            )

            if (enemyResult.error) {
                return
            }

            if (enemyResult.targetPlayerId && enemyResult.updatedPlayers) {
                updatedPlayers = enemyResult.updatedPlayers

                if (typeof onCharacterHpChange === 'function') {
                    onCharacterHpChange(enemyResult.targetPlayerId, enemyResult.updatedPlayerHp)
                }
            }

            if (enemyResult.logMessage) {
                allLogMessages.push(enemyResult.logMessage)
            }

            // Process enemy end of turn status effects
            processCharacterEndOfTurn(enemy)

            if (enemyResult.shouldEndBattle) {
                setCombatState(prev => ({ ...prev, playerCharacters: updatedPlayers, enemies: updatedEnemies }))
                endBattle(enemyResult.result)
                return
            }
        })

        allLogMessages.forEach(message => addLog(message))

        setCombatState(prev => ({
            ...prev,
            playerCharacters: updatedPlayers,
            enemies: updatedEnemies,
            currentTurn: 'player',
            currentPlayerTurnIndex: findNextAlivePlayer(updatedPlayers, -1)
        }))
    }

    // ========== BATTLE CONCLUSION ==========
    const endBattle = (result) => {
        setCombatPositions(activeCharacters)

        if (result === 'defeat') {
            combatState.playerCharacters.forEach(char => {
                if (typeof onResetCharacterHp === 'function') {
                    onResetCharacterHp(char.id)
                }
            })
        }

        setCombatState(prev => ({ ...prev, battleStatus: result }))

        if (result === 'victory') {
            const coinsWon = getBattleReward()
            addLog(`¡Victoria! Ganaste ${coinsWon} monedas`)
            onCoinUpdate(coinsWon)
        } else {
            const coinsLost = getBattlePenalty()
            addLog(`¡Derrota! Perdiste ${coinsLost} monedas`)
            onCoinUpdate(-coinsLost)
            onResetDungeon()
        }

        setTimeout(() => {
            onCombatEnd(result)
        }, 3000)
    }

    // ===== TOOLTIP HANDLERS =====
    // ===== TOOLTIP HANDLERS =====
    const showTooltip = (event, attack) => {
        const currentPlayer = getCurrentPlayerTurn();
        const rect = event.currentTarget.getBoundingClientRect();

        // Get the actual description text by calling the function
        const descriptionText = attack.description && typeof attack.description === 'function'
            ? attack.description(currentPlayer || { physicalAttack: 0, psychicAttack: 0 })
            : attack.name;

        setTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            content: (
                <div>
                    <div className="tooltip-title">{attack.name}</div>
                    <div className="tooltip-description" style={{ whiteSpace: 'pre-line' }}>
                        {descriptionText}
                    </div>
                    {attack.statusEffects && attack.statusEffects.length > 0 && (
                        <div className="tooltip-keywords">
                            {attack.statusEffects.map((status, i) => (
                                <span
                                    key={i}
                                    className="tooltip-keyword"
                                    onMouseEnter={(e) => showKeywordTooltip(e, status)}
                                    onMouseLeave={hideKeywordTooltip}
                                >
                                    {status.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )
        })
    }

    const hideTooltip = () => {
        setTooltip({ visible: false, x: 0, y: 0, content: null })
    }

    const showKeywordTooltip = (event, status) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setKeywordTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            content: (
                <div>
                    <div className="tooltip-title">{status.name}</div>
                    <div className="tooltip-description" style={{ whiteSpace: 'pre-line' }}>
                        {status.description}
                    </div>
                </div>
            )
        })
    }

    const hideKeywordTooltip = () => {
        setKeywordTooltip({ visible: false, x: 0, y: 0, content: null })
    }


    // ========== RENDER STATUS EFFECTS ==========
    const renderStatusEffects = (character) => {
        const statusEffects = getStatusEffectsForCharacter(character)

        if (statusEffects.length === 0) return null

        return (
            <div className="status-effects-container">
                {statusEffects.map((status, index) => (
                    <div
                        key={`${status.type}-${index}`}
                        className="status-effect-badge"
                        style={{
                            borderColor: getStatusEffectColor(status.type),
                            backgroundColor: `${getStatusEffectColor(status.type)}20`
                        }}
                        title={`${status.name} - ${status.stacks} stack(s) - Duración: ${status.duration !== null ? status.duration : '∞'}`}
                    >
                        {getStatusEffectIcon(status.type)}
                        {status.stacks > 1 && <span className="status-stack-count">{status.stacks}</span>}
                    </div>
                ))}
            </div>
        )
    }

    // ========== RENDER COMPONENT ==========
    return (
        <div className="combat-overlay">
            <div className="combat-container" style={{ position: 'relative' }}>

                {/* ========== COMBAT HEADER ========== */}
                <div className="combat-header">
                    <h2>⚔️ Combate por Turnos</h2>
                    <div className="turn-indicator">
                        Turno: {combatState.currentTurn === 'player' ? `JUGADOR - ${getCurrentPlayerTurn()?.name || 'Sin jugador'}` : 'ENEMIGO'}
                    </div>
                    <div className="alive-players-count">
                        Jugadores vivos: {getAlivePlayersCount()}/{combatState.playerCharacters.length}
                    </div>
                    <div className="alive-enemies-count">
                        Enemigos vivos: {getAliveEnemiesCount()}/{combatState.enemies.length}
                    </div>

                    {/* TARGETING MODE INDICATOR */}
                    {targetingMode && (
                        <div className="targeting-indicator">
                            🎯 {selectedSpecialAttack ? getAttackById(selectedSpecialAttack)?.name : selectedAttackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'} SELECCIONADO - HAZ CLIC EN UN ENEMIGO
                        </div>
                    )}
                </div>

                {/* ========== BATTLE FIELD ========== */}
                <div className="battle-field">

                    {/* ========== PLAYER SIDE ========== */}
                    <div className="player-side">
                        {/* Back Row - Only render if there are characters */}
                        {combatPositions.back.some(char => char !== null) && (
                            <div className="position-column back-row-column">
                                <div className="position-label">Fila Trasera</div>
                                {combatPositions.back.map((char, index) => (
                                    char ? (
                                        <div
                                            key={`back-${char.id}-${index}`}
                                            className={`combatant player-combatant ${getCurrentPlayerTurn()?.id === char.id ? 'active-turn' : ''} ${combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 ? 'defeated' : ''}`}
                                            onClick={() => handleCharacterClick(char)}
                                        >
                                            <div className="combatant-info">
                                                <h3>{char.name}</h3>
                                                <div className="hp-bar">
                                                    <div
                                                        className="hp-fill"
                                                        style={{ width: `${getHpPercentage(combatState.playerCharacters.find(p => p.id === char.id)?.currentHp || 0, playerMaxHp)}%` }}
                                                    ></div>
                                                    <span className="hp-text">
                                                        PV: {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp || 0}/{playerMaxHp}
                                                    </span>
                                                </div>
                                                {/* Status Effects Display */}
                                                {renderStatusEffects(combatState.playerCharacters.find(p => p.id === char.id))}
                                                <div className="position-badge back-badge">Trasero</div>
                                            </div>
                                            <div className="combatant-image">
                                                <img src={char.images?.[0]} alt={char.name} />
                                                {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                            </div>
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        )}

                        {/* Front Row - Only render if there are characters */}
                        {combatPositions.front.some(char => char !== null) && (
                            <div className="position-column front-row-column">
                                <div className="position-label">Fila Delantera</div>
                                {combatPositions.front.map((char, index) => (
                                    char ? (
                                        <div
                                            key={`front-${char.id}-${index}`}
                                            className={`combatant player-combatant ${getCurrentPlayerTurn()?.id === char.id ? 'active-turn' : ''} ${combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 ? 'defeated' : ''}`}
                                            onClick={() => handleCharacterClick(char)}
                                        >
                                            <div className="combatant-info">
                                                <h3>{char.name}</h3>
                                                <div className="hp-bar">
                                                    <div
                                                        className="hp-fill"
                                                        style={{ width: `${getHpPercentage(combatState.playerCharacters.find(p => p.id === char.id)?.currentHp || 0, playerMaxHp)}%` }}
                                                    ></div>
                                                    <span className="hp-text">
                                                        PV: {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp || 0}/{playerMaxHp}
                                                    </span>
                                                </div>
                                                {/* Status Effects Display */}
                                                {renderStatusEffects(combatState.playerCharacters.find(p => p.id === char.id))}
                                                <div className="position-badge front-badge">Delantero</div>
                                            </div>
                                            <div className="combatant-image">
                                                <img src={char.images?.[0]} alt={char.name} />
                                                {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                            </div>
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ========== VS SEPARATOR ========== */}
                    <div className="vs-separator">VS</div>

                    {/* ========== ENEMY SIDE ========== */}
                    <div className="enemy-side">
                        {/* Enemy Front Row - Only render if there are enemies */}
                        {combatState.enemies.some(enemy => enemy.position === 'front' && enemy.isAlive) && (
                            <div className="enemy-position-column enemy-front-column">
                                <div className="position-label">Fila Delantera Enemiga</div>
                                <div className="enemy-row-container">
                                    {[0, 1, 2].map(slot => {
                                        const enemy = combatState.enemies?.find(
                                            e => e.position === 'front' && e.slot === slot && e.isAlive
                                        )
                                        return enemy ? (
                                            <div key={`enemy-front-${slot}`} className="enemy-slot">
                                                <div
                                                    className={`combatant enemy-combatant ${enemy.currentHp <= 0 ? 'defeated' : ''} ${targetingMode && isEnemyTargetable(enemy) ? 'targetable' : ''}`}
                                                    onClick={() => handleEnemyClick(enemy)}
                                                >
                                                    <div className="combatant-info">
                                                        <h3>{enemy.name}</h3>
                                                        <div className="hp-bar">
                                                            <div
                                                                className="hp-fill"
                                                                style={{ width: `${getHpPercentage(enemy.currentHp, enemy.maxHp)}%` }}
                                                            ></div>
                                                            <span className="hp-text">
                                                                PV: {enemy.currentHp}/{enemy.maxHp}
                                                            </span>
                                                        </div>
                                                        {/* Status Effects Display */}
                                                        {renderStatusEffects(enemy)}
                                                        <div className="stats">
                                                            <span>ATAQ FÍS: {enemy.physicalAttack}</span>
                                                            <span>ATAQ PSÍ: {enemy.psychicAttack}</span>
                                                        </div>
                                                    </div>
                                                    <div className="combatant-image">
                                                        <img src={enemy.image} alt={enemy.name} />
                                                        {enemy.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                                        {targetingMode && isEnemyTargetable(enemy) && (
                                                            <div className="target-icon">🎯</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Enemy Back Row - Only render if there are enemies */}
                        {combatState.enemies.some(enemy => enemy.position === 'back' && enemy.isAlive) && (
                            <div className="enemy-position-column enemy-back-column">
                                <div className="position-label">Fila Trasera Enemiga</div>
                                <div className="enemy-row-container">
                                    {[0, 1, 2].map(slot => {
                                        const enemy = combatState.enemies?.find(
                                            e => e.position === 'back' && e.slot === slot && e.isAlive
                                        )
                                        return enemy ? (
                                            <div key={`enemy-back-${slot}`} className="enemy-slot">
                                                <div
                                                    className={`combatant enemy-combatant ${enemy.currentHp <= 0 ? 'defeated' : ''} ${targetingMode && isEnemyTargetable(enemy) ? 'targetable' : ''}`}
                                                    onClick={() => handleEnemyClick(enemy)}
                                                >
                                                    <div className="combatant-info">
                                                        <h3>{enemy.name}</h3>
                                                        <div className="hp-bar">
                                                            <div
                                                                className="hp-fill"
                                                                style={{ width: `${getHpPercentage(enemy.currentHp, enemy.maxHp)}%` }}
                                                            ></div>
                                                            <span className="hp-text">
                                                                PV: {enemy.currentHp}/{enemy.maxHp}
                                                            </span>
                                                        </div>
                                                        {/* Status Effects Display */}
                                                        {renderStatusEffects(enemy)}
                                                        <div className="stats">
                                                            <span>ATAQ FÍS: {enemy.physicalAttack}</span>
                                                            <span>ATAQ PSÍ: {enemy.psychicAttack}</span>
                                                        </div>
                                                    </div>
                                                    <div className="combatant-image">
                                                        <img src={enemy.image} alt={enemy.name} />
                                                        {enemy.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                                        {targetingMode && isEnemyTargetable(enemy) && (
                                                            <div className="target-icon">🎯</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========== ACTION BUTTONS ========== */}
                {combatState.currentTurn === 'player' && combatState.battleStatus === 'ongoing' && getCurrentPlayerTurn()?.currentHp > 0 && (
                    <div className="action-buttons">
                        <div className="current-turn-indicator">
                            Turno: {getCurrentPlayerTurn()?.name}
                            {getStatusEffectsForCharacter(getCurrentPlayerTurn()).length > 0 && (
                                <span className="status-indicator"> (Tiene {getStatusEffectsForCharacter(getCurrentPlayerTurn()).length} estado(s))</span>
                            )}
                        </div>

                        {!targetingMode ? (
                            <>
                                {/* Basic Attacks */}
                                {getAllBasicAttacks().map(attack => (
                                    <button
                                        key={attack.id}
                                        className={`attack-btn ${attack.type}-attack`}
                                        onClick={() => handleSelectAttackType(attack.type)}
                                        onMouseEnter={(e) => showTooltip(e, attack)}
                                        onMouseLeave={hideTooltip}
                                    >
                                        {attack.type === 'physical' ? '🗡️' : '🔮'} {attack.name}
                                    </button>
                                ))}

                                {/* Special Attacks */}
                                {getAllSpecialAttacks().map(attack => (
                                    <button
                                        key={attack.id}
                                        className={`attack-btn ${attack.type}-attack special-${attack.id.toLowerCase()}`}
                                        onClick={() => handleSelectSpecialAttack(attack.id)}
                                        onMouseEnter={(e) => showTooltip(e, attack)}
                                        onMouseLeave={hideTooltip}
                                    >
                                        {getStatusEffectIcon(attack.statusEffects?.[0]?.type) || '⚡'} {attack.name}
                                    </button>
                                ))}
                                <button
                                    className="position-btn"
                                    onClick={handlePositionSwap}
                                >
                                    🔄 Cambiar Posición
                                </button>
                            </>
                        ) : (
                            <button
                                className="cancel-btn"
                                onClick={handleCancelTargeting}
                            >
                                ❌ Cancelar Selección
                            </button>
                        )}
                    </div>
                )}

                {/* ========== BATTLE LOG ========== */}
                <div className="battle-log">
                    <h4>Registro de Batalla:</h4>
                    <div className="log-messages">
                        {getLastBattleLogs(combatState.battleLog).map((log, index) => (
                            <div key={index} className="log-message">
                                {log.message}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ========== BATTLE RESULT ========== */}
                {combatState.battleStatus !== 'ongoing' && (
                    <div className={`battle-result ${combatState.battleStatus}`}>
                        <h2>
                            {combatState.battleStatus === 'victory' ? '¡VICTORIA!' : '¡DERROTA!'}
                        </h2>
                        <p>
                            {combatState.battleStatus === 'victory'
                                ? `Has derrotado a todos los enemigos`
                                : `Has sido derrotado`
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* ========== CHARACTER DETAIL MODAL ========== */}
            {selectedCharacter && (
                <CharacterDetail
                    character={selectedCharacter}
                    onClose={closeCharacterDetail}
                />
            )}

            {/* TOOLTIP OVERLAYS */}
            {tooltip.visible && (
                <div
                    className="combat-tooltip visible"
                    style={{
                        top: `${tooltip.y}px`,
                        left: `${tooltip.x}px`,
                        transform: 'translate(-50%, -100%)',
                        marginTop: '-10px'
                    }}
                    onMouseEnter={() => setTooltip(prev => ({ ...prev, visible: true }))}
                    onMouseLeave={hideTooltip}
                >
                    {tooltip.content}
                </div>
            )}

            {keywordTooltip.visible && (
                <div
                    className="tooltip-keyword-tooltip"
                    style={{
                        top: `${keywordTooltip.y}px`,
                        left: `${keywordTooltip.x}px`,
                        transform: 'translate(-50%, -100%)',
                        marginTop: '-10px'
                    }}
                    onMouseEnter={() => setKeywordTooltip(prev => ({ ...prev, visible: true }))}
                    onMouseLeave={hideKeywordTooltip}
                >
                    {keywordTooltip.content}
                </div>
            )}
        </div>
    )
}

export default Combat