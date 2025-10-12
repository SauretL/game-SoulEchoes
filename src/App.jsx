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

// ========== GAME CONSTANTS ==========
const GACHA_PULL_COST = 50
const DEFAULT_CHARACTER_ID = 16
const PULL_COUNT = 5

// ========== CHARACTER OBJECT CREATOR ==========
const createCharacterObject = (characterData, duplicates = 1) => {
  if (!characterData) return null

  return {
    id: characterData.id,
    name: characterData.name,
    epitaph: characterData.epitaph,
    rarity: characterData.rarity,
    rarityTier: characterData.rarityTier,
    class: characterData.class,
    fragment: characterData.fragment,
    images: characterData.images,
    duplicates: duplicates,
    gender: characterData.gender,
    age: characterData.age,
    birthday: characterData.birthday,
    likes: characterData.likes,
    dislikes: characterData.dislikes,
    favoriteFood: characterData.favoriteFood,
    hobbies: characterData.hobbies,
    stories: characterData.stories,
    skillsNames: characterData.skillsNames,
    skillsDescriptions: characterData.skillsDescriptions,
    quotes: characterData.quotes,
    equipmentNames: characterData.equipmentNames,
    equipmentDescriptions: characterData.equipmentDescriptions,
    opinions: characterData.opinions,
    fragments: characterData.fragments,
    birthdayQuoteSelf: characterData.birthdayQuoteSelf,
    birthdayQuotePlayer: characterData.birthdayQuotePlayer
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

  // ========== CHARACTER DATA MANAGEMENT ==========
  const [playerCharacters, setPlayerCharacters] = useState(() => {
    const valeria = allCharacters.find(char => char.id === DEFAULT_CHARACTER_ID)
    return valeria ? [createCharacterObject(valeria, 1)] : []
  })

  // ========== PLAYER HP MANAGEMENT ==========
  const [playerCharactersHp, setPlayerCharactersHp] = useState({})

  // ========== ACTIVE CHARACTERS MANAGEMENT ==========
  const [activeCharacters, setActiveCharacters] = useState({
    front: [null, null, null], // [left, center, right]
    back: [null, null, null]   // [left, center, right]
  })

  // ========== UTILITY FUNCTIONS ==========

  /**
   * Counts total active characters
   */
  const getActiveCharactersCount = useCallback(() => {
    const frontCount = activeCharacters.front.filter(char => char !== null).length
    const backCount = activeCharacters.back.filter(char => char !== null).length
    return frontCount + backCount
  }, [activeCharacters])

  /**
   * Checks if a character is active
   */
  const isCharacterActive = useCallback((character) => {
    return activeCharacters.front.some(char => char?.id === character.id) ||
      activeCharacters.back.some(char => char?.id === character.id)
  }, [activeCharacters])

  /**
   * Gets the first active character
   */
  const getFirstActiveCharacter = useCallback(() => {
    // Check front row first
    for (let char of activeCharacters.front) {
      if (char) return char
    }
    // Then check back row
    for (let char of activeCharacters.back) {
      if (char) return char
    }
    return null
  }, [activeCharacters])

  // ========== ACTIVE CHARACTER SLOT MANAGEMENT ==========

  /**
   * Sets a character to active slot
   */
  const setActiveCharacter = useCallback((character, position, slot) => {
    setActiveCharacters(prev => {
      const currentActiveCount = getActiveCharactersCount()
      const isAlreadyActive = isCharacterActive(character)

      // If character is null, we're removing from that position
      if (character === null) {
        const newActive = { ...prev }
        newActive[position][slot] = null
        return newActive
      }

      // If already 3 active characters and adding new one
      if (currentActiveCount >= 3 && !isAlreadyActive) {
        alert("Maximum 3 active characters! Remove one first.")
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
  }, [getActiveCharactersCount, isCharacterActive])

  // ========== DEFAULT CHARACTER SETUP ==========
  useEffect(() => {
    const valeria = allCharacters.find(char => char.id === DEFAULT_CHARACTER_ID)

    // Only auto-assign Valeria if NO characters are active at all
    const totalActive = getActiveCharactersCount()
    if (valeria && totalActive === 0) {
      setActiveCharacters(prev => ({
        ...prev,
        front: [createCharacterObject(valeria, 1), null, null]
      }))
    }
  }, [allCharacters, getActiveCharactersCount])

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

  /**
   * Adds characters to player collection
   */
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

    // Auto-assign first character to active slot if no active characters
    if (getFirstActiveCharacter() === null && newCharacters.length > 0) {
      setActiveCharacter(newCharacters[0], 'front', 0)
    }
  }, [setActiveCharacter, getFirstActiveCharacter])

  // ========== CURRENCY MANAGEMENT ==========

  /**
   * Adds coins earned from dungeon
   */
  const addCoinsFromDungeon = useCallback((coins) => {
    setPlayerCoins(prevCoins => prevCoins + coins)
  }, [])

  // ========== CHARACTER HP MANAGEMENT ==========

  /**
   * Updates character HP
   */
  const updateCharacterHp = useCallback((characterId, newHp) => {
    setPlayerCharactersHp(prev => ({
      ...prev,
      [characterId]: Math.max(0, newHp)
    }))
  }, [])

  /**
   * Resets character HP to max
   */
  const resetCharacterHp = useCallback((characterId) => {
    setPlayerCharactersHp(prev => ({
      ...prev,
      [characterId]: playerMaxHp
    }))
  }, [playerMaxHp])

  // ========== GACHA SYSTEM ==========

  /**
   * Handles gacha pull
   */
  const gachaButton = () => {
    // Validate player has enough coins
    if (playerCoins < GACHA_PULL_COST) {
      alert("Not enough coins to do a pull!")
      return
    }

    // Validate characters data is available
    if (!allCharacters || allCharacters.length === 0) {
      alert("Error: No characters available in the system")
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

  /**
   * Starts combat with enemy
   */
  const startCombat = useCallback((enemy) => {
    setCurrentEnemy(enemy)
    setShowCombat(true)
    setIsInCombat(true)
  }, [])

  /**
   * Ends combat
   */
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
    // Reset player HP if needed
    // setPlayerHp(playerMaxHp)
  }, []) // Removed playerMaxHp dependency as setPlayerHp is not defined

  /** Force ends combat from dungeon*/
  const forceEndCombatFromDungeon = useCallback(() => {
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
          onForceEndCombat={forceEndCombatFromDungeon}
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
          playerCharacters={playerCharacters}
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