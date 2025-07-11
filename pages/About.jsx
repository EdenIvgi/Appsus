
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
                    <h1>About Page</h1>
                </div>
            </div>
        </section>
    )
}
