import { useState } from 'react'
import './CharacterDetail.css'

function CharacterDetail({ character, onClose }) {
    // ========== STATE MANAGEMENT ==========
    const [activeTab, setActiveTab] = useState('general')
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [modalImageIndex, setModalImageIndex] = useState(0)

    // ========== EARLY RETURN ==========
    if (!character) return null

    // ========== IMAGE NAVIGATION FUNCTIONS ==========
    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev < (character.images?.length - 1) ? prev + 1 : 0
        )
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev > 0 ? prev - 1 : (character.images?.length - 1)
        )
    }

    const nextModalImage = () => {
        setModalImageIndex((prev) =>
            prev < (character.images?.length - 1) ? prev + 1 : 0
        )
    }

    const prevModalImage = () => {
        setModalImageIndex((prev) =>
            prev > 0 ? prev - 1 : (character.images?.length - 1)
        )
    }

    // ========== MODAL MANAGEMENT ==========
    const openImageModal = (index) => {
        setModalImageIndex(index)
        setIsImageModalOpen(true)
    }

    const closeImageModal = () => {
        setIsImageModalOpen(false)
    }

    // ========== RARITY TIER 1 - SIMPLIFIED VIEW ==========
    if (character.rarityTier === 1) {
        return (
            <div className="character-detail-overlay">
                <div className="character-detail-container simplified-view">
                    {/* HEADER SECTION */}
                    <div className="detail-header">
                        <h1>{character.name}</h1>
                        <button className="close-button" onClick={onClose}>×</button>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="simplified-content">
                        {/* IMAGE GALLERY */}
                        <div className="image-section">
                            <div className="main-image-container">
                                <img
                                    src={character.images?.[currentImageIndex]}
                                    alt={character.name}
                                    className="main-image"
                                />
                                {character.images?.length > 1 && (
                                    <>
                                        <button className="image-nav prev" onClick={prevImage}>‹</button>
                                        <button className="image-nav next" onClick={nextImage}>›</button>
                                        <div className="image-counter">
                                            {currentImageIndex + 1} / {character.images.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* CHARACTER INFORMATION */}
                        <div className="simplified-info">
                            {/* BASIC INFO */}
                            <div className="basic-info">
                                <p><strong>Epitafio:</strong> {character.epitaph}</p>
                                <p><strong>Género:</strong> {character.gender}</p>
                                <p><strong>Rareza:</strong> {character.rarity}</p>
                                <p><strong>Clase:</strong> {character.class}</p>
                                <p><strong>Fragmento:</strong> {character.fragment}</p>
                            </div>

                            {/* STORY SECTION */}
                            {character.stories?.[0] && (
                                <div className="story-section">
                                    <h3>Historia</h3>
                                    <p>{character.stories[0]}</p>
                                </div>
                            )}

                            {/* EQUIPMENT SECTION */}
                            <div className="equipment-section">
                                <h3>Equipamiento</h3>
                                <p>{character.equipmentNames?.[0] || 'Ninguno'}</p>
                            </div>

                            {/* SKILLS SECTION */}
                            <div className="skills-section">
                                <h3>Habilidades</h3>
                                <p>{character.skillsNames?.[0] || 'Ninguno'}</p>
                            </div>

                            {/* QUOTES SECTION */}
                            {character.quotes?.[0] && (
                                <div className="quotes-section">
                                    <h3>Frase</h3>
                                    <p>"{character.quotes[0]}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ========== RARITY TIER 2 & 3 - COMPLETE VIEW ==========
    return (
        <div className="character-detail-overlay">
            <div className="character-detail-container">
                {/* HEADER SECTION */}
                <div className="detail-header">
                    <h1>{character.name}</h1>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {/* MAIN CONTENT SECTION */}
                <div className="detail-content">
                    {/* IMAGE GALLERY SECTION */}
                    <div className="image-section">
                        <div className="main-image-container">
                            <img
                                src={character.images?.[currentImageIndex]}
                                alt={character.name}
                                className="main-image"
                            />
                            {character.images?.length > 1 && (
                                <>
                                    <button className="image-nav prev" onClick={prevImage}>‹</button>
                                    <button className="image-nav next" onClick={nextImage}>›</button>
                                    <div className="image-counter">
                                        {currentImageIndex + 1} / {character.images.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* INFORMATION SECTION */}
                    <div className="info-section">
                        {/* TAB NAVIGATION */}
                        <div className="tabs">
                            {['general', 'quotes', 'story', 'gallery', 'skills', 'equipment'].map(tab => (
                                <button
                                    key={tab}
                                    className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'general' && 'General'}
                                    {tab === 'quotes' && 'Frases'}
                                    {tab === 'story' && 'Historia'}
                                    {tab === 'gallery' && 'Galería'}
                                    {tab === 'skills' && 'Habilidades'}
                                    {tab === 'equipment' && 'Equipamiento'}
                                </button>
                            ))}
                        </div>

                        {/* TAB CONTENT AREA */}
                        <div className="tab-content">
                            {/* GENERAL TAB CONTENT */}
                            {activeTab === 'general' && (
                                <div className="general-info">
                                    <p><strong>Epitafio:</strong> {character.epitaph}</p>
                                    <p><strong>Rareza:</strong> {character.rarity}</p>
                                    <p><strong>Clase:</strong> {character.class}</p>
                                    <p><strong>Fragmento:</strong> {character.fragment}</p>
                                    <p><strong>Género:</strong> {character.gender}</p>
                                    <p><strong>Edad:</strong> {character.age}</p>
                                    <p><strong>Cumpleaños:</strong> {character.birthday}</p>
                                    <p><strong>Gustos:</strong> {character.likes}</p>
                                    <p><strong>Disgustos:</strong> {character.dislikes}</p>
                                    <p><strong>Comida favorita:</strong> {character.favoriteFood}</p>
                                    <p><strong>Hobbies:</strong> {character.hobbies}</p>
                                </div>
                            )}

                            {/* QUOTES TAB CONTENT */}
                            {activeTab === 'quotes' && (
                                <div className="quotes-info">
                                    <h3>Frases</h3>
                                    {character.quotes?.map((quote, index) => (
                                        quote && <p key={index}>"{quote}"</p>
                                    ))}

                                    <h3>Frases de Cumpleaños</h3>
                                    <p><strong>Propio:</strong> {character.birthdayQuoteSelf}</p>
                                    <p><strong>Al Jugador:</strong> {character.birthdayQuotePlayer}</p>

                                    <h3>Opiniones</h3>
                                    {character.opinions?.map((opinion, index) => (
                                        opinion && <p key={index}>{opinion}</p>
                                    ))}

                                    <h3>Frases sobre Fragmentos</h3>
                                    {character.fragments && Object.entries(character.fragments).map(([key, value]) => (
                                        value && <p key={key}><strong>{key}:</strong> {value}</p>
                                    ))}
                                </div>
                            )}

                            {/* STORY TAB CONTENT */}
                            {activeTab === 'story' && (
                                <div className="story-info">
                                    {character.stories?.map((story, index) => (
                                        story && (
                                            <div key={index} className="story-section">
                                                <h3>Historia {index + 1}</h3>
                                                <p>{story}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {/* GALLERY TAB CONTENT */}
                            {activeTab === 'gallery' && (
                                <div className="gallery-info">
                                    <div className="gallery-grid">
                                        {character.images?.map((image, index) => (
                                            image && (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt={`${character.name} ${index + 1}`}
                                                    className={`gallery-thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                                                    onClick={() => openImageModal(index)}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SKILLS TAB CONTENT */}
                            {activeTab === 'skills' && (
                                <div className="skills-info">
                                    {character.skillsNames?.map((skillName, index) => (
                                        skillName && (
                                            <div key={index} className="skill-section">
                                                <h3>{skillName}</h3>
                                                <p>{character.skillsDescriptions?.[index]}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {/* EQUIPMENT TAB CONTENT */}
                            {activeTab === 'equipment' && (
                                <div className="equipment-info">
                                    {character.equipmentNames?.map((equipName, index) => (
                                        equipName && (
                                            <div key={index} className="equipment-section">
                                                <h3>{equipName}</h3>
                                                <p>{character.equipmentDescriptions?.[index]}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* IMAGE MODAL FOR GALLERY */}
                {isImageModalOpen && (
                    <div className="image-modal-overlay" onClick={closeImageModal}>
                        <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
                            <button className="image-modal-close" onClick={closeImageModal}>×</button>
                            <div className="image-modal-content">
                                <img
                                    src={character.images?.[modalImageIndex]}
                                    alt={`${character.name} ${modalImageIndex + 1}`}
                                    className="image-modal-img"
                                />
                            </div>
                            {character.images?.length > 1 && (
                                <>
                                    <button className="image-modal-nav image-modal-prev" onClick={prevModalImage}>‹</button>
                                    <button className="image-modal-nav image-modal-next" onClick={nextModalImage}>›</button>
                                    <div className="image-modal-counter">
                                        {modalImageIndex + 1} / {character.images.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CharacterDetail