
const { useNavigate } = ReactRouterDOM

export function About() {
    const navigate = useNavigate()

    function navigateToHome() {
        navigate('/')
        // Scroll to top after navigation
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
    }

    function navigateToMail() {
        navigate('/mail')
        // Scroll to top after navigation
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
    }

    function navigateToNotes() {
        navigate('/note')
        // Scroll to top after navigation
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
    }

    return (
        <section className="about-page">
            <header className="appsus-header">
                <div className="appsus-header-left">
                    <span className="material-symbols-outlined orbit-icon icon-large" onClick={navigateToHome}>
                        orbit
                    </span>
                    <span className="appsus-title">Appsus</span>
                </div>
                
                <div className="appsus-header-nav">
                    <button className="nav-btn current">
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

            <div className="about-main">
                <div className="container">
                    <h1>About Appsus</h1>
                    <div className="about-content">
                        <div className="about-intro">
                            <p>
                                <strong>Amir Avni</strong> and <strong>Eden Ivgi</strong> are full-stack development students at Coding Academy. 
                                Together, they created <strong>Appsus</strong> – a comprehensive productivity suite designed to simplify 
                                everyday tasks and enhance your digital workflow.
                            </p>
                        </div>
                        
                        <div className="about-apps">
                            <h2>Our Applications</h2>
                            <div className="app-grid">
                                <div className="app-card">
                                    <div className="app-icon">
                                        <span className="material-symbols-outlined">lightbulb</span>
                                    </div>
                                    <h3>Misskeep (Notes)</h3>
                                    <p>
                                        <strong>Developed by Amir</strong> - A powerful note-taking application inspired by Google Keep. 
                                        Organize your thoughts with text notes, images, videos, and todo lists. Features include 
                                        color coding, labels, archive functionality, and seamless organization.
                                    </p>
                                </div>
                                
                                <div className="app-card">
                                    <div className="app-icon">
                                        <span className="material-symbols-outlined">mail</span>
                                    </div>
                                    <h3>Gmail Clone (Mail)</h3>
                                    <p>
                                        <strong>Developed by Eden</strong> - A fully-featured email client that replicates the Gmail 
                                        experience. Send, receive, and organize emails with folders, search functionality, 
                                        and a clean, intuitive interface.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="about-mission">
                            <h2>Our Mission</h2>
                            <p>
                                At Appsus, we believe that technology should simplify life, not complicate it. Our suite of 
                                applications is designed to help you stay organized, communicate effectively, and manage your 
                                daily tasks with ease. Whether you're jotting down ideas, managing your inbox, or planning your day, 
                                Appsus has you covered.
                            </p>
                        </div>
                        
                        <div className="about-tech">
                            <h2>Built With</h2>
                            <p>
                                Appsus is built using modern web technologies including React, JavaScript, and CSS3. 
                                This project represents our journey in mastering full-stack development and creating 
                                user-centered applications.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
