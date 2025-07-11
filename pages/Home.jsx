import { LongTxt } from "../cmps/LongTxt.jsx"
import { Modal } from "../cmps/Modal.jsx"
import { showSuccessMsg } from "../services/event-bus.service.js"
import { utilService } from "../services/util.service.js"

const { useState, useEffect, useRef } = React
const { useNavigate } = ReactRouterDOM

export function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    const titleRef = useRef()

    function onActivateAnimation() {
        utilService.animateCSS(titleRef.current, 'pulse')
    }

    function openModal() {
        setIsModalOpen(true)
    }

    function closeModal() {
        setIsModalOpen(false)
    }

    function onGetStarted() {
        setTimeout(() => {
            showSuccessMsg('Welcome to Appsus!')
            closeModal()
        }, 500)
    }

    function navigateToMail() {
        navigate('/mail')
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
    }

    function navigateToNotes() {
        navigate('/note')
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
    }

    function navigateToAbout() {
        navigate('/about')
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
    }

    function navigateToBooks() {
        navigate('/book')
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
    }

    return (
        <section className="home">
            <header className="appsus-header">
                <div className="appsus-header-left">
                    <span className="material-symbols-outlined orbit-icon icon-large">
                        orbit
                    </span>
                    <span className="appsus-title">Appsus</span>
                </div>
                
                <div className="appsus-header-nav">
                    <button className="nav-btn" onClick={navigateToAbout}>
                        <span className="material-symbols-outlined">info</span>
                        <span>About</span>
                    </button>
                    <button className="nav-btn" onClick={navigateToMail}>
                        <span className="material-symbols-outlined">mail</span>
                        <span>Mail</span>
                    </button>
                    <button className="nav-btn" onClick={navigateToNotes}>
                        <span className="material-symbols-outlined">note</span>
                        <span>Notes</span>
                    </button>
                </div>
            </header>

            <div className="home-main">
                <div className="home-hero">
                    <div className="container">
                        <h1 ref={titleRef} className="home-title">Welcome to Appsus</h1>
                        <p className="home-subtitle">Your productivity workspace</p>
                    </div>
                </div>

                <div className="container">
                    <div className="home-content">
                        <div className="intro-section">
                            <div className="intro-card">
                                <h2>What is Appsus?</h2>
                                <LongTxt 
                                    txt="Appsus is a clean, modern productivity suite that brings together email management, note-taking, and book management in one seamless workspace. Built with simplicity in mind, it helps you stay organized and focused on what matters most. Whether you're managing your inbox, capturing important thoughts, or organizing your book collection, Appsus provides the tools you need without the clutter."
                                    length={120}
                                />
                            </div>
                        </div>

                        <div className="apps-grid">
                            <div className="app-card">
                                <div className="app-icon mail-icon">
                                    <span>📧</span>
                                </div>
                                <h3>Mail</h3>
                                <p>Clean, fast email management with smart organization and search.</p>
                                <button className="app-btn" onClick={navigateToMail}>Open Mail</button>
                            </div>

                            <div className="app-card">
                                <div className="app-icon notes-icon">
                                    <span>📝</span>
                                </div>
                                <h3>Notes</h3>
                                <p>Capture and organize your thoughts with rich text and media support.</p>
                                <button className="app-btn" onClick={navigateToNotes}>Open Notes</button>
                            </div>

                            <div className="app-card">
                                <div className="app-icon books-icon">
                                    <span>📚</span>
                                </div>
                                <h3>Books</h3>
                                <p>Manage your book collection with pricing, reviews, and sales tracking.</p>
                                <button className="app-btn" onClick={navigateToBooks}>Open Books</button>
                            </div>
                        </div>

                        <div className="action-section">
                            <button className="btn-primary" onClick={openModal}>
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal onClose={closeModal} isOpen={isModalOpen}>
                <div className="modal-body">
                    <h2>Welcome to Appsus</h2>
                    <p>Choose your preferred app to get started with your productivity journey.</p>
                    <div className="modal-apps">
                        <button className="modal-app-btn mail-btn" onClick={navigateToMail}>
                            <span className="modal-app-icon">📧</span>
                            <span>Start with Mail</span>
                        </button>
                        <button className="modal-app-btn notes-btn" onClick={navigateToNotes}>
                            <span className="modal-app-icon">📝</span>
                            <span>Start with Notes</span>
                        </button>
                        <button className="modal-app-btn books-btn" onClick={navigateToBooks}>
                            <span className="modal-app-icon">📚</span>
                            <span>Start with Books</span>
                        </button>
                    </div>
                    <div className="modal-actions">
                        <button className="btn-primary" onClick={onGetStarted}>
                            Continue
                        </button>
                    </div>
        </div>
            </Modal>
    </section>
    )
}