const { NavLink } = ReactRouterDOM

export function GmailHeader({ searchTerm, onSearch, onToggleSidebar }) {
    return (
        <header className="gmail-header">
            <div className="gmail-header-left">
                <span
                    className="material-symbols-outlined menu-icon icon-large"
                    onClick={onToggleSidebar}
                    title="Toggle sidebar"
                >
                    menu
                </span>
                <img className="gmail-logo" src="assets/img/gmail-logo.png" alt="Gmail logo" />
                <span className="gmail-title">Gmail</span>
            </div>

            <div className="gmail-header-search">
                <div className="search-wrapper">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search mail"
                        value={searchTerm}
                        onChange={e => onSearch(e.target.value)}
                    />
                </div>
            </div>

            <nav className="gmail-header-nav">
                <NavLink to="/" className="nav-link">
                    <span className="material-symbols-outlined">home</span>
                    <span>Home</span>
                </NavLink>
                <NavLink to="/about" className="nav-link">
                    <span className="material-symbols-outlined">info</span>
                    <span>About</span>
                </NavLink>
                <NavLink to="/note" className="nav-link">
                    <span className="material-symbols-outlined">note</span>
                    <span>Note</span>
                </NavLink>
            </nav>
        </header>
    )
}
