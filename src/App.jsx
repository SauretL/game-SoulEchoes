import './App.css'
import { useState, useCallback, useEffect } from 'react'
import GachaCards from './components/GachaCards/GachaCards.jsx'
import PlayerLibrary from './components/PlayerLibrary/PlayerLibrary.jsx'
import gachaPull from './utils/gachaPull.js'
import CharacterDetail from './components/CharacterDetail/CharacterDetail.jsx'
import PlayerStats from './components/PlayerStats/PlayerStats.jsx'
import allCharacters from './data/characters.json'
import Dungeon from './components/Dungeon/Dungeon.jsx'
import enemies from './data/enemies.json'
import Combat from './components/Combat/Combat.jsx'
import { getActiveCharactersCount, isCharacterActive, getFirstActiveCharacter } from './utils/formationUtils'

// ========== GAME CONSTANTS ==========
const GACHA_PULL_COST = 50
const DEFAULT_CHARACTER_ID = 16
const PULL_COUNT = 5
const MAX_CHARACTERS = 3

// ========== CHARACTER OBJECT CREATOR ==========
const createCharacterObject = (characterData, duplicates = 1) => {
  if (!characterData) return null

  return {
    ...characterData,    // Copy all character data
    duplicates: duplicates  // Adds duplicate numbers
  }
}

function App() {
  // ========== STATE MANAGEMENT ==========
  const [currentView, setCurrentView] = useState("start")
  const [characterArray, setCharacterArray] = useState([])
  const [pullCount, setPullCount] = useState(0)
  const [showCombat, setShowCombat] = useState(false)
  const [currentEnemy, setCurrentEnemy] = useState(null)
  const [sortBy, setSortBy] = useState("id")
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [playerCoins, setPlayerCoins] = useState(50)
  const [isInCombat, setIsInCombat] = useState(false)
  const [playerMaxHp] = useState(100)
  const [playerCharactersHp, setPlayerCharactersHp] = useState({})

  // ========== CHARACTER DATA MANAGEMENT ==========
  const [playerCharacters, setPlayerCharacters] = useState(() => {
    const defaultChar = allCharacters.find(char => char.id === DEFAULT_CHARACTER_ID)
    return defaultChar ? [createCharacterObject(defaultChar, 1)] : []
  })

  // ========== ACTIVE CHARACTERS MANAGEMENT ==========
  const [activeCharacters, setActiveCharacters] = useState({
    front: [null, null, null], // [left, center, right]
    back: [null, null, null]   // [left, center, right]
  })

  // ========== ACTIVE CHARACTER SLOT MANAGEMENT ==========

  /* Sets a character to active slot*/
  const setActiveCharacter = useCallback((character, position, slot) => {
    setActiveCharacters(prev => {
      const currentActiveCount = getActiveCharactersCount(prev)
      const isAlreadyActive = isCharacterActive(prev, character)

      // If character is null, we're removing from that position
      if (character === null) {
        const newActive = { ...prev }
        newActive[position][slot] = null
        return newActive
      }

      // If already 3 active characters and adding new one
      if (currentActiveCount >= MAX_CHARACTERS && !isAlreadyActive) {
        alert(`¡Máximo de ${MAX_CHARACTERS} personajes activos! Remueve uno primero.`)
        return prev
      }

      const newActive = { ...prev }

      // Remove character from any existing position
      Object.keys(newActive).forEach(row => {
        newActive[row] = newActive[row].map(posChar =>
          posChar?.id === character.id ? null : posChar
        )
      })

      // Place character in new position
      newActive[position][slot] = character

      return newActive
    })
  }, [])

  // ========== DEFAULT CHARACTER SETUP ==========
  useEffect(() => {
    const defaultChar = allCharacters.find(char => char.id === DEFAULT_CHARACTER_ID)

    const totalActive = getActiveCharactersCount(activeCharacters)

    if (defaultChar && totalActive === 0) {
      setActiveCharacters(prev => ({
        ...prev,
        front: [createCharacterObject(defaultChar, 1), null, null]
      }))
    }
  }, [allCharacters, activeCharacters])

  // ========== INITIALIZE CHARACTER HP ==========
  useEffect(() => {
    // Initialize HP for all player characters
    const initialHp = {}
    playerCharacters.forEach(char => {
      if (!initialHp[char.id]) {
        initialHp[char.id] = playerMaxHp
      }
    })
    setPlayerCharactersHp(prev => ({ ...prev, ...initialHp }))
  }, [playerCharacters, playerMaxHp])

  // ========== CHARACTER COLLECTION MANAGEMENT ==========

  /*Adds characters to player collection*/
  const addToPlayerCollection = useCallback((newCharacters) => {
    setPlayerCharacters(prevCollection => {
      const updatedCollection = [...prevCollection]

      newCharacters.forEach(newChar => {
        const existingCharIndex = updatedCollection.findIndex(
          char => char.id === newChar.id
        )

        if (existingCharIndex !== -1) {
          // Update duplicate count for existing character
          updatedCollection[existingCharIndex] = {
            ...updatedCollection[existingCharIndex],
            duplicates: updatedCollection[existingCharIndex].duplicates + 1
          }
        } else {
          // Add new character to collection
          updatedCollection.push(createCharacterObject(newChar, 1))
        }
      })

      return updatedCollection
    })
  }, [setActiveCharacter, activeCharacters])

  // ========== CURRENCY MANAGEMENT ==========

  /*Adds coins earned from dungeon*/
  const addCoinsFromDungeon = useCallback((coins) => {
    setPlayerCoins(prevCoins => prevCoins + coins)
  }, [])

  // ========== CHARACTER HP MANAGEMENT ==========

  /*Updates character HP*/
  const updateCharacterHp = useCallback((characterId, newHp) => {
    setPlayerCharactersHp(prev => ({
      ...prev,
      [characterId]: Math.max(0, newHp)
    }))
  }, [])

  /*Resets character HP to max*/
  const resetCharacterHp = useCallback((characterId) => {
    setPlayerCharactersHp(prev => ({
      ...prev,
      [characterId]: playerMaxHp
    }))
  }, [playerMaxHp])

  // ========== GACHA SYSTEM ==========

  /*Handles gacha pull*/
  const gachaButton = () => {
    // Validate player has enough coins
    if (playerCoins < GACHA_PULL_COST) {
      alert("No tienes suficientes monedas para sacar más Almas")
      return
    }

    // Deduct coins and perform gacha pull
    setPlayerCoins(prevCoins => prevCoins - GACHA_PULL_COST)
    const rawResults = gachaPull(allCharacters, PULL_COUNT)
    const newPull = pullCount + 1
    setPullCount(newPull)

    // Annotate results with unique identifiers for React keys
    const annotated = rawResults.map((char, i) => {
      return {
        ...char,
        _drawUid: "pull-" + newPull + "-" + i + "-" + Math.random().toString(36).slice(2, 6)
      }
    })

    setCharacterArray(annotated)
    addToPlayerCollection(rawResults)
  }

  // ========== COMBAT MANAGEMENT ==========

  /*Starts combat with enemy*/
  const startCombat = useCallback((enemy) => {
    setCurrentEnemy(enemy)
    setShowCombat(true)
    setIsInCombat(true)
  }, [])

  /*Ends combat*/
  const endCombat = useCallback((result) => {
    setShowCombat(false)
    setCurrentEnemy(null)
    setIsInCombat(false)
    console.log(`Combat ended with result: ${result}`)
  }, [])

  /* Resets dungeon state*/
  const resetDungeon = useCallback(() => {
    setShowCombat(false)
    setCurrentEnemy(null)
    setIsInCombat(false)
  }, [])

  // ========== VIEW NAVIGATION ==========

  /* Changes current view*/
  const changeView = useCallback((view) => {
    setCurrentView(view)
  }, [])

  // ========== CHARACTER SORTING ==========

  /* Gets sorted character collection*/
  const getSortedCollection = useCallback(() => {
    const sorted = [...playerCharacters]

    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "rarity":
        return sorted.sort((a, b) => b.rarityTier - a.rarityTier || a.name.localeCompare(b.name))
      case "fragment":
        return sorted.sort((a, b) => a.fragment.localeCompare(b.fragment) || a.name.localeCompare(b.name))
      case "class":
        return sorted.sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name))
      case "duplicates":
        return sorted.sort((a, b) => b.duplicates - a.duplicates || a.name.localeCompare(b.name))
      case "id":
      default:
        return sorted.sort((a, b) => a.id - b.id)
    }
  }, [playerCharacters, sortBy])

  // ========== CHARACTER DETAIL MANAGEMENT ==========

  /* Handles character click for details*/
  const handleCharacterClick = useCallback((character) => {
    setSelectedCharacter(character)
  }, [])

  /* Closes character detail view*/
  const closeCharacterDetail = useCallback(() => {
    setSelectedCharacter(null)
  }, [])

  // ========== RENDER COMPONENT ==========
  return (
    <div className="app-container">

      {/* ========== START VIEW ========== */}
      {currentView === "start" && (
        <div className="start-view">
          <h1>Soul Echoes</h1>
          <p>A lo largo de distintos mundos y eras, han surgido héroes y villanos cuyas grandes hazañas dejaron una huella imborrable en la historia. Las almas de estos personajes resuenan a través de los diferentes fragmentos de la realidad. Hoy, esos fragmentos han convergido y sus ecos han vuelto a la vida. Escuche sus voces: descubra las historias que estas almas guardan, mientras le ayudan en su propósito de reunir todas sus leyendas.</p>
          <button onClick={() => changeView("gacha")}>Comenzar Juego</button>
        </div>
      )}

      {/* ========== GACHA VIEW ========== */}
      {currentView === "gacha" && (
        <div className="gacha-view">
          <h1>Soul Echoes</h1>

          {/* ========== COINS DISPLAY IN GACHA VIEW ========== */}
          <div className="coins-display" style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
            Monedas: {playerCoins}
          </div>

          <p>Descubre nuevas Almas</p>
          <button onClick={gachaButton}>¡Prueba tu suerte! ({GACHA_PULL_COST} coins)</button>
          <button
            onClick={() => changeView("dungeon")}
            style={{ marginLeft: '10px', backgroundColor: '#8B4513' }}
          >
            Explorar Dungeon
          </button>
          <button
            onClick={() => changeView("library")}
            style={{ marginLeft: '10px' }}
          >
            Ver mi Biblioteca de Almas ({playerCharacters.length})
          </button>
          <GachaCards
            arrayInicial={characterArray}
            onCharacterClick={handleCharacterClick}
          />
        </div>
      )}

      {/* ========== LIBRARY VIEW ========== */}
      {currentView === "library" && (
        <PlayerLibrary
          playerCharacters={getSortedCollection()}
          sortBy={sortBy}
          setSortBy={setSortBy}
          playerCoins={playerCoins}
          onBack={() => changeView("gacha")}
          onCharacterClick={handleCharacterClick}
          onShowStats={() => changeView("stats")}
          onExploreDungeon={() => changeView("dungeon")}
          setActiveCharacter={setActiveCharacter}
          setActiveCharacters={setActiveCharacters}
          activeCharacters={activeCharacters}
        />
      )}

      {/* ========== STATS VIEW ========== */}
      {currentView === "stats" && (
        <PlayerStats
          playerCharacters={playerCharacters}
          allCharacters={allCharacters}
          playerCoins={playerCoins}
          onBack={() => changeView("library")}
        />
      )}

      {/* ========== DUNGEON VIEW ========== */}
      {currentView === "dungeon" && (
        <Dungeon
          onBack={() => changeView("gacha")}
          onCoinEarned={addCoinsFromDungeon}
          playerCoins={playerCoins}
          activeCharacters={activeCharacters}
          onCharacterClick={handleCharacterClick}
          onStartCombat={startCombat}
          enemies={enemies}
          inCombat={isInCombat}
          onResetDungeon={resetDungeon}
          playerCharactersHp={playerCharactersHp}
          playerMaxHp={playerMaxHp}
        />
      )}

      {/* ========== CHARACTER DETAIL MODAL ========== */}
      {selectedCharacter && (
        <CharacterDetail
          character={selectedCharacter}
          onClose={closeCharacterDetail}
        />
      )}

      {/* ========== COMBAT OVERLAY ========== */}
      {showCombat && currentEnemy && (
        <Combat
          // FIXED: Removed duplicate playerCharacters prop that conflicts with activeCharacters
          activeCharacters={activeCharacters}
          enemy={currentEnemy}
          onCombatEnd={(result) => {
            endCombat(result)
            setIsInCombat(false)
          }}
          onCoinUpdate={addCoinsFromDungeon}
          onResetDungeon={() => {
            resetDungeon()
          }}
          playerCharactersHp={playerCharactersHp}
          playerMaxHp={playerMaxHp}
          onCharacterHpChange={updateCharacterHp}
          onResetCharacterHp={resetCharacterHp}
        />
      )}
    </div>
  )
}

export default App