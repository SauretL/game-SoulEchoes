import './App.css'
import { useEffect, useState } from 'react'
import loadArray from './utils/loadArray.js'

function App() {

  //create states for the different page looks
  const [currentView, setCurrentView] = useState("start")

  // change the current view for the other one
  const changeView = () => {
    setCurrentView(currentView === "start" ? "gacha" : "start")
  }

  useEffect(() => {
    loadArray("./public/data/characters.json")
      .then(data => {
        console.log("The characters are:", data)
      })
  },
    []
  )


  return (

    currentView === "start" ? (

      <>
        <h1>Soul Echoes</h1>

        <p>A lo largo de distintos mundos y tiempos han surgido héroes y villanos que llevaron a cabo grandes hazañas que dejaron su huella en la historia. Las almas de estos personajes hacen eco en los distintos fragmentos de la realidad. Hoy, esos fragmentos se han unido y estos ecos han tomado vida nuevamente. Escucha sus voces: descubre las historias que guardan estas almas mientras te ayudan a continuar con tu objetivo de reunir todos sus relatos.</p>
        <button onClick={changeView}>Comienza el juego</button>
      </>
    ) : (<>
      <h1>Soul Echoes</h1>

      <p>¡Empieza el gacha!</p>

      <button>¡Prueba tu suerte!</button>
    </>)
  )
}

export default App
