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
    getBattlePenalty
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
    const [combatState, setCombatState] = useState(() =>
        initializeCombatState(activeCharacters, enemy, playerCharactersHp, playerMaxHp)
    )

    const [combatPositions, setCombatPositions] = useState({
        front: [null, null, null],
        back: [null, null, null]
    })

    const [selectedCharacter, setSelectedCharacter] = useState(null)

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

    // ========== CHARACTER CLICK HANDLER ==========
    const handleCharacterClick = (character) => {
        if (combatState.battleStatus === 'ongoing') {
            setSelectedCharacter(character)
        }
    }

    const closeCharacterDetail = () => {
        setSelectedCharacter(null)
    }

    // ========== POSITION SWAP ACTION ==========
    const handlePositionSwap = () => {
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') return

        const currentPlayer = getCurrentPlayerTurn()
        if (!currentPlayer || currentPlayer.currentHp <= 0) return

        // Use combat logic for position swap
        const swapResult = executePlayerPositionSwap(combatPositions, currentPlayer)

        if (!swapResult.success) {
            addLog(swapResult.message)
            return
        }

        setCombatPositions(swapResult.newPositions)
        addLog(swapResult.logMessage)
        endPlayerTurn()
    }

    // ========== PLAYER ATTACK ACTION ==========
    const playerAttack = (attackType) => {
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') return

        // Use combat logic for player attack
        const attackResult = executePlayerAttack(combatState, attackType)

        if (attackResult.shouldSkipTurn) {
            endPlayerTurn()
            return
        }

        addLog(attackResult.logMessage)

        if (attackResult.shouldEndBattle) {
            // Update enemy HP before ending battle
            setCombatState(prev => ({
                ...prev,
                enemy: { ...prev.enemy, currentHp: attackResult.updatedEnemyHp }
            }))
            endBattle(attackResult.result)
        } else {
            // Update enemy HP and continue
            setCombatState(prev => ({
                ...prev,
                enemy: { ...prev.enemy, currentHp: attackResult.updatedEnemyHp }
            }))
            endPlayerTurn()
        }
    }

    // ========== END PLAYER TURN ==========
    const endPlayerTurn = () => {
        // Use combat logic for turn management
        const turnResult = handleEndPlayerTurn(combatState)

        if (turnResult.shouldEndBattle) {
            endBattle(turnResult.result)
            return
        }

        // Update state based on turn result
        setCombatState(prev => ({
            ...prev,
            ...turnResult.newState
        }))
    }

    // ========== ENEMY TURN ==========
    const enemyTurn = () => {
        // Use combat logic for enemy turn
        const enemyResult = executeEnemyTurn(combatState, combatState.enemy)

        if (enemyResult.error) return

        // Update parent component HP
        if (enemyResult.targetPlayerId && typeof onCharacterHpChange === 'function') {
            onCharacterHpChange(enemyResult.targetPlayerId, enemyResult.updatedPlayerHp)
        }

        addLog(enemyResult.logMessage)

        if (enemyResult.shouldEndBattle) {
            // Update players before ending
            setCombatState(prev => ({
                ...prev,
                playerCharacters: enemyResult.updatedPlayers
            }))
            endBattle(enemyResult.result)
            return
        }

        // Continue battle with updated state
        setCombatState(prev => ({
            ...prev,
            ...enemyResult.newState
        }))
    }

    // ========== BATTLE CONCLUSION ==========
    const endBattle = (result) => {
        setCombatPositions(activeCharacters)

        // Reset HP on defeat only
        if (result === 'defeat') {
            combatState.playerCharacters.forEach(char => {
                if (typeof onResetCharacterHp === 'function') {
                    onResetCharacterHp(char.id)
                }
            })
        }

        setCombatState(prev => ({ ...prev, battleStatus: result }))

        // Handle rewards/penalties
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
                        <div className="combatant enemy-combatant">
                            <div className="combatant-info">
                                <h3>{enemy.name}</h3>
                                <div className="hp-bar">
                                    <div
                                        className="hp-fill"
                                        style={{ width: `${getHpPercentage(combatState.enemy.currentHp, enemy.maxHp)}%` }}
                                    ></div>
                                    <span className="hp-text">
                                        PV: {combatState.enemy.currentHp}/{enemy.maxHp}
                                    </span>
                                </div>
                                <div className="stats">
                                    <span>Ataque Fís: {enemy.physicalAttack}</span>
                                    <span>Ataque Psí: {enemy.psychicAttack}</span>
                                    <span>Defensa Fís: {enemy.physicalDefense}</span>
                                    <span>Defensa Psí: {enemy.psychicDefense}</span>
                                </div>
                            </div>
                            <div className="combatant-image">
                                <img src={enemy.image} alt={enemy.name} />
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
                        <button
                            className="attack-btn physical-attack"
                            onClick={() => playerAttack('physical')}
                        >
                            🗡️ Ataque Físico
                        </button>
                        <button
                            className="attack-btn psychic-attack"
                            onClick={() => playerAttack('psychic')}
                        >
                            🔮 Ataque Psíquico
                        </button>
                        <button
                            className="position-btn"
                            onClick={handlePositionSwap}
                        >
                            🔄 Cambiar Posición
                        </button>
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
                                ? `Derrotaste a ${enemy.name}`
                                : `Fuiste derrotado por ${enemy.name}`
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