export function GmailHeader({ searchTerm, onSearch, onToggleSidebar }) {
    return (
        <header className="gmail-header">
            <span className="material-symbols-outlined menu-icon" onClick={onToggleSidebar}>
                menu
            </span>

            <img className="gmail-logo" src="assets/img/gmail-logo.png" />
            <span className="gmail-title">Gmail</span>

            <div className="search-wrapper">
                <span className="material-symbols-outlined">search</span>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search mail"
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>
        </header>
    )
}
