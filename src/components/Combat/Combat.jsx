import React, { useState } from 'react'
import './Combat.css'
import { performAttack, enemyAI, checkBattleEnd, getBattleReward, getBattlePenalty } from '../../utils/combatLogic'

// Default stats for characters without defined combat stats
const defaultStats = {
    maxHp: 100,
    physicalAttack: 10,
    psychicAttack: 8,
    physicalDefense: 5,
    psychicDefense: 4
}

const Combat = ({
    playerCharacter,
    enemy,
    onCombatEnd,
    onCoinUpdate,
    onResetDungeon
}) => {
    // ========== STATE MANAGEMENT ==========
    const [combatState, setCombatState] = useState({
        player: {
            ...playerCharacter,
            currentHp: playerCharacter.maxHp || 100
        },
        enemy: {
            ...enemy,
            currentHp: enemy.maxHp || 80
        },
        currentTurn: 'player',
        battleLog: [],
        battleStatus: 'ongoing'
    })

    // ========== BATTLE LOG MANAGEMENT ==========
    const addToBattleLog = (message) => {
        setCombatState(prev => ({
            ...prev,
            battleLog: [...prev.battleLog, { message, timestamp: Date.now() }]
        }))
    }

    // ========== PLAYER ACTIONS ==========
    const playerAttack = (attackType) => {
        // Validate if player can attack
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') return

        // Apply default stats to ensure all combat values are defined
        const playerWithStats = { ...defaultStats, ...combatState.player }
        const enemyWithStats = { ...defaultStats, ...combatState.enemy }

        // Calculate attack result
        const result = performAttack(playerWithStats, enemyWithStats, attackType)

        // Create battle log message
        const attackName = attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
        const criticalText = result.isCritical ? ' ¡CRÍTICO!' : ''
        addToBattleLog(`${playerCharacter.name} usa ${attackName} - ${result.damage} de daño${criticalText}`)

        // Calculate enemy HP after attack
        const updatedEnemyHp = enemyWithStats.currentHp - result.damage

        // Check if battle ends with this attack
        const battleResult = checkBattleEnd(playerWithStats, {
            ...enemyWithStats,
            currentHp: updatedEnemyHp
        })

        if (battleResult === 'player_won') {
            endBattle('victory')
        } else {
            // Continue battle - enemy's turn
            setCombatState(prev => ({
                ...prev,
                enemy: { ...prev.enemy, currentHp: updatedEnemyHp },
                currentTurn: 'enemy'
            }))
            setTimeout(enemyTurn, 1500) // Delay for enemy turn
        }
    }

    // ========== ENemy AI TURN ==========
    const enemyTurn = () => {
        // Validate if enemy can attack
        if (combatState.battleStatus !== 'ongoing') return

        // Apply default stats
        const playerWithStats = { ...defaultStats, ...combatState.player }
        const enemyWithStats = { ...defaultStats, ...combatState.enemy }

        // Calculate enemy AI decision and attack
        const result = enemyAI(enemyWithStats, playerWithStats)

        // Create battle log message
        const attackName = result.attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
        const criticalText = result.isCritical ? ' ¡CRÍTICO!' : ''
        addToBattleLog(`${enemy.name} usa ${attackName} - ${result.damage} de daño${criticalText}`)

        // Calculate player HP after attack
        const updatedPlayerHp = playerWithStats.currentHp - result.damage

        // Check if battle ends with this attack
        const battleResult = checkBattleEnd(
            { ...playerWithStats, currentHp: updatedPlayerHp },
            enemyWithStats
        )

        if (battleResult === 'player_lost') {
            endBattle('defeat')
        } else {
            // Continue battle - player's turn
            setCombatState(prev => ({
                ...prev,
                player: { ...prev.player, currentHp: updatedPlayerHp },
                currentTurn: 'player'
            }))
        }
    }

    // ========== BATTLE CONCLUSION ==========
    const endBattle = (result) => {
        // Update battle status
        setCombatState(prev => ({ ...prev, battleStatus: result }))

        // Handle rewards or penalties
        if (result === 'victory') {
            const coinsWon = getBattleReward()
            addToBattleLog(`¡Victoria! Ganas ${coinsWon} monedas`)
            onCoinUpdate(coinsWon)
        } else {
            const coinsLost = getBattlePenalty()
            addToBattleLog(`¡Derrota! Pierdes ${coinsLost} monedas`)
            onCoinUpdate(-coinsLost)
            onResetDungeon()
        }

        // Delay before closing combat
        setTimeout(() => {
            onCombatEnd(result)
        }, 3000)
    }

    // ========== UTILITY FUNCTIONS ==========
    const getHpPercentage = (current, max) => {
        return Math.max((current / max) * 100, 0)
    }

    // ========== RENDER COMPONENT ==========
    return (
        <div className="combat-overlay">
            <div className="combat-container">

                {/* ========== COMBAT HEADER ========== */}
                <div className="combat-header">
                    <h2>⚔️ Combate por Turnos</h2>
                    <div className="turn-indicator">
                        Turno: {combatState.currentTurn === 'player' ? 'JUGADOR' : 'ENEMIGO'}
                    </div>
                </div>

                {/* ========== BATTLE FIELD ========== */}
                <div className="battle-field">

                    {/* Player Combatant */}
                    <div className="combatant player-combatant">
                        <div className="combatant-info">
                            <h3>{playerCharacter.name}</h3>
                            <div className="hp-bar">
                                <div
                                    className="hp-fill"
                                    style={{ width: `${getHpPercentage(combatState.player.currentHp, playerCharacter.maxHp)}%` }}
                                ></div>
                                <span className="hp-text">
                                    HP: {combatState.player.currentHp}/{playerCharacter.maxHp}
                                </span>
                            </div>
                            <div className="stats">
                                <span>ATQ Fís: {playerCharacter.physicalAttack}</span>
                                <span>ATQ Psíq: {playerCharacter.psychicAttack}</span>
                                <span>DEF Fís: {playerCharacter.physicalDefense}</span>
                                <span>DEF Psíq: {playerCharacter.psychicDefense}</span>
                            </div>
                        </div>
                        <div className="combatant-image">
                            <img src={playerCharacter.images?.[0]} alt={playerCharacter.name} />
                        </div>
                    </div>

                    {/* VS Separator */}
                    <div className="vs-separator">VS</div>

                    {/* Enemy Combatant */}
                    <div className="combatant enemy-combatant">
                        <div className="combatant-info">
                            <h3>{enemy.name}</h3>
                            <div className="hp-bar">
                                <div
                                    className="hp-fill"
                                    style={{ width: `${getHpPercentage(combatState.enemy.currentHp, enemy.maxHp)}%` }}
                                ></div>
                                <span className="hp-text">
                                    HP: {combatState.enemy.currentHp}/{enemy.maxHp}
                                </span>
                            </div>
                            <div className="stats">
                                <span>ATQ Fís: {enemy.physicalAttack}</span>
                                <span>ATQ Psíq: {enemy.psychicAttack}</span>
                                <span>DEF Fís: {enemy.physicalDefense}</span>
                                <span>DEF Psíq: {enemy.psychicDefense}</span>
                            </div>
                        </div>
                        <div className="combatant-image">
                            <img src={enemy.image} alt={enemy.name} />
                        </div>
                    </div>
                </div>

                {/* ========== ACTION BUTTONS ========== */}
                {combatState.currentTurn === 'player' && combatState.battleStatus === 'ongoing' && (
                    <div className="action-buttons">
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
                    </div>
                )}

                {/* ========== BATTLE LOG ========== */}
                <div className="battle-log">
                    <h4>Registro de Combate:</h4>
                    <div className="log-messages">
                        {combatState.battleLog.slice(-6).map((log, index) => (
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
                                ? `Has vencido a ${enemy.name}`
                                : `Has sido derrotado por ${enemy.name}`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Combat