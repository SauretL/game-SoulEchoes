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
    createTargetingMessage
} from '../../utils/combatLogic'
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
        const initialState = initializeCombatState(activeCharacters, enemiesArray, playerCharactersHp, playerMaxHp)

        return {
            ...initialState,
            enemies: enemiesArray.map((e, index) => ({
                ...e,
                id: e.id || `enemy_${index}`,
                currentHp: e.currentHp || e.maxHp,
                position: e.position || 'front',
                slot: e.slot !== undefined ? e.slot : index,
                isAlive: true
            }))
        }
    })

    const [combatPositions, setCombatPositions] = useState({
        front: [null, null, null],
        back: [null, null, null]
    })

    const [selectedCharacter, setSelectedCharacter] = useState(null)
    const [selectedAttackType, setSelectedAttackType] = useState(null)
    const [targetingMode, setTargetingMode] = useState(false)

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
        return combatState.playerCharacters[combatState.currentPlayerTurnIndex]
    }

    const getAlivePlayersCount = () => {
        return getAlivePlayersCountLogic(combatState.playerCharacters)
    }

    const getAliveEnemiesCount = () => {
        return combatState.enemies.filter(enemy => enemy.currentHp > 0 && enemy.isAlive).length
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

        // Use combat logic to validate selection
        if (!canSelectAttackType(combatState.currentTurn, combatState.battleStatus, currentPlayer)) {
            return
        }

        setSelectedAttackType(attackType)
        setTargetingMode(true)

        // Use combat logic to create targeting message
        addLog(createTargetingMessage(attackType))
    }

    // ========== ENEMY TARGET SELECTION ==========
    const handleEnemyClick = (enemy) => {
        // Only allow targeting if in targeting mode
        if (!targetingMode || !selectedAttackType) return
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') return

        // Use combat logic to validate target
        if (!isEnemyTargetable(enemy)) return

        // Execute the attack
        executeAttack(selectedAttackType, enemy)

        // Reset targeting mode
        setTargetingMode(false)
        setSelectedAttackType(null)
    }

    // ========== CANCEL TARGETING ==========
    const handleCancelTargeting = () => {
        setTargetingMode(false)
        setSelectedAttackType(null)
        addLog("❌ Selección de ataque cancelada")
    }

    // ========== POSITION SWAP ACTION ==========
    const handlePositionSwap = () => {
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') return
        if (targetingMode) {
            addLog("⚠️ Cancela primero la selección de ataque")
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
    const executeAttack = (attackType, targetEnemy) => {
        const currentPlayer = getCurrentPlayerTurn()
        if (!currentPlayer || currentPlayer.currentHp <= 0) return

        // Use combat logic for player attack
        const attackResult = executePlayerAttack(combatState, attackType, targetEnemy)

        if (attackResult.shouldSkipTurn) {
            endPlayerTurn()
            return
        }

        addLog(attackResult.logMessage)

        // Update ONLY the targeted enemy's HP
        const updatedEnemies = combatState.enemies.map(enemy =>
            enemy.id === targetEnemy.id
                ? {
                    ...enemy,
                    currentHp: attackResult.updatedEnemyHp,
                    isAlive: attackResult.updatedEnemyHp > 0
                }
                : enemy
        )

        // Check if all enemies are defeated
        if (areAllEnemiesDefeated(updatedEnemies)) {
            setCombatState(prev => ({
                ...prev,
                enemies: updatedEnemies
            }))
            endBattle('victory')
        } else {
            setCombatState(prev => ({
                ...prev,
                enemies: updatedEnemies
            }))
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

        combatState.enemies.forEach(enemy => {
            if (enemy.currentHp <= 0 || !enemy.isAlive) return

            const enemyResult = executeEnemyTurn(
                { ...combatState, playerCharacters: updatedPlayers },
                enemy
            )

            if (enemyResult.error) return

            if (enemyResult.targetPlayerId && enemyResult.updatedPlayers) {
                updatedPlayers = enemyResult.updatedPlayers

                if (typeof onCharacterHpChange === 'function') {
                    onCharacterHpChange(enemyResult.targetPlayerId, enemyResult.updatedPlayerHp)
                }
            }

            if (enemyResult.logMessage) {
                allLogMessages.push(enemyResult.logMessage)
            }

            if (enemyResult.shouldEndBattle) {
                setCombatState(prev => ({
                    ...prev,
                    playerCharacters: updatedPlayers
                }))
                endBattle(enemyResult.result)
                return
            }
        })

        allLogMessages.forEach(message => addLog(message))

        setCombatState(prev => ({
            ...prev,
            playerCharacters: updatedPlayers,
            currentTurn: 'player',
            currentPlayerTurnIndex: 0
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

    // ========== RENDER COMPONENT ==========
    return (
        <div className="combat-overlay">
            <div className="combat-container">

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
                            🎯 SELECCIONA UN ENEMIGO PARA ATACAR
                        </div>
                    )}
                </div>

                {/* ========== BATTLE FIELD ========== */}
                <div className="battle-field">

                    {/* ========== PLAYER SIDE ========== */}
                    <div className="player-side">
                        {/* Back Row */}
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
                                            <div className="position-badge back-badge">Trasero</div>
                                        </div>
                                        <div className="combatant-image">
                                            <img src={char.images?.[0]} alt={char.name} />
                                            {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={`back-empty-${index}`} className="combatant empty-slot">
                                        <div className="empty-slot-content">Vacío</div>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Front Row */}
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
                                            <div className="position-badge front-badge">Delantero</div>
                                        </div>
                                        <div className="combatant-image">
                                            <img src={char.images?.[0]} alt={char.name} />
                                            {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={`front-empty-${index}`} className="combatant empty-slot">
                                        <div className="empty-slot-content">Vacío</div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* ========== VS SEPARATOR ========== */}
                    <div className="vs-separator">VS</div>

                    {/* ========== ENEMY SIDE ========== */}
                    <div className="enemy-side">
                        {/* Enemy Front Row - LEFT COLUMN (mirror of player back row) */}
                        <div className="enemy-position-column enemy-front-column">
                            <div className="position-label">Fila Delantera Enemiga</div>
                            <div className="enemy-row-container">
                                {[0, 1, 2].map(slot => {
                                    const enemy = combatState.enemies?.find(
                                        e => e.position === 'front' && e.slot === slot && e.isAlive
                                    )
                                    return (
                                        <div key={`enemy-front-${slot}`} className="enemy-slot">
                                            {enemy ? (
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
                                                        <div className="stats">
                                                            <span>ATK F: {enemy.physicalAttack}</span>
                                                            <span>ATK P: {enemy.psychicAttack}</span>
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
                                            ) : (
                                                <div className="empty-enemy-slot">Vacío</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Enemy Back Row - RIGHT COLUMN (mirror of player front row) */}
                        <div className="enemy-position-column enemy-back-column">
                            <div className="position-label">Fila Trasera Enemiga</div>
                            <div className="enemy-row-container">
                                {[0, 1, 2].map(slot => {
                                    const enemy = combatState.enemies?.find(
                                        e => e.position === 'back' && e.slot === slot && e.isAlive
                                    )
                                    return (
                                        <div key={`enemy-back-${slot}`} className="enemy-slot">
                                            {enemy ? (
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
                                                        <div className="stats">
                                                            <span>ATK F: {enemy.physicalAttack}</span>
                                                            <span>ATK P: {enemy.psychicAttack}</span>
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
                                            ) : (
                                                <div className="empty-enemy-slot">Vacío</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== ACTION BUTTONS ========== */}
                {combatState.currentTurn === 'player' && combatState.battleStatus === 'ongoing' && getCurrentPlayerTurn()?.currentHp > 0 && (
                    <div className="action-buttons">
                        <div className="current-turn-indicator">
                            Turno: {getCurrentPlayerTurn()?.name}
                        </div>

                        {!targetingMode ? (
                            <>
                                <button
                                    className="attack-btn physical-attack"
                                    onClick={() => handleSelectAttackType('physical')}
                                >
                                    🗡️ Ataque Físico
                                </button>
                                <button
                                    className="attack-btn psychic-attack"
                                    onClick={() => handleSelectAttackType('psychic')}
                                >
                                    🔮 Ataque Psíquico
                                </button>
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
                    <h4>Registro de Combate:</h4>
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
                                ? `Derrotaste a todos los enemigos`
                                : `Fuiste derrotado`
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
        </div>
    )
}

export default Combat