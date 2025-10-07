import './App.css'
import { useEffect, useState } from 'react'
import GachaCards from './components/GachaCards.jsx'
import gachaPull from './utils/gachaPull.js'
import loadArray from './utils/loadArray.js'

function App() {

  //create states for the different page looks
  const [currentView, setCurrentView] = useState("start")
  const changeView = () => {
    if (currentView === "start") setCurrentView("gacha")
    else setCurrentView("start")
  }

  const [characterArray, setCharacterArray] = useState([])
  const [allCharacters, setAllCharacters] = useState([])
  const [pullCount, setPullCount] = useState(0)

  useEffect(() => {
    loadArray("./public/data/characters.json")
      .then(charsArray => setAllCharacters(charsArray))
      .catch(error => console.error("Error loading characters:", error))
  }, [])

  function gachaButton() {
    if (allCharacters.length > 0) {
      const rawResults = gachaPull(allCharacters, 5)
      const newPull = pullCount + 1
      setPullCount(newPull)
      const annotated = rawResults.map((char, i) => {
        return {
          name: char.name,
          epitaph: char.epitaph,
          rarity: char.rarity,
          rarityTier: char.rarityTier,
          class: char.class,
          fragment: char.fragment,
          images: char.images,
          equipmentNames: char.equipmentNames,
          skillsNames: char.skillsNames,
          quotes: char.quotes,
          _drawUid: "pull-" + newPull + "-" + i + "-" + Math.random().toString(36).slice(2, 6)
        }
      })
      setCharacterArray(annotated)
    }
  }


  return (
    currentView === "start" ? (
      <div className="app-container">
        <div className="start-view">
          <h1>Soul Echoes</h1>
          <p>A lo largo de distintos mundos y tiempos han surgido héroes y villanos que llevaron a cabo grandes hazañas que dejaron su huella en la historia. Las almas de estos personajes hacen eco en los distintos fragmentos de la realidad. Hoy, esos fragmentos se han unido y estos ecos han tomado vida nuevamente. Escucha sus voces: descubre las historias que guardan estas almas mientras te ayudan a continuar con tu objetivo de reunir todos sus relatos.</p>
          <button onClick={changeView}>Comienza el juego</button>
        </div>
      </div>
    ) : (
      <div className="app-container">
        <div className="gacha-view">
          <h1>Soul Echoes</h1>
          <p>¡Empieza el gacha!</p>
          <button onClick={gachaButton}>¡Prueba tu suerte!</button>
          <GachaCards arrayInicial={characterArray} />
        </div>
      </div>
    )
  )
}

export default App

