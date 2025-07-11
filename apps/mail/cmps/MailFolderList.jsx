const { useNavigate, useLocation } = ReactRouterDOM

export function MailFolderList({ filterBy, onSetFilter, isSidebarOpen, inboxCount }) {
    const navigate = useNavigate()
    const location = useLocation()

    const folders = [
        { icon: 'inbox', label: 'Inbox' },
        { icon: 'star', label: 'Starred' },
        { icon: 'send', label: 'Sent' },
        { icon: 'draft', label: 'Draft' },
        { icon: 'delete', label: 'Trash' },
    ]

    function handleFolderClick(folder) {
        const selectedFilter = folder.label.toLowerCase()
        onSetFilter(selectedFilter)

        if (!location.pathname.startsWith('/mail') || location.pathname !== '/mail') {
            navigate('/mail')
        }
    }

    return (
        <nav className="sidebar-nav">
            {folders.map(folder => {
                const folderKey = folder.label.toLowerCase()
                const isSelected = filterBy === folderKey
                return (
                    <div
                        key={folder.label}
                        className={`nav-item ${isSelected ? 'active' : ''}`}
                        onClick={() => handleFolderClick(folder)}
                    >
                        <span className="icon-wrapper">
                            <span className="material-symbols-outlined nav-icon">{folder.icon}</span>
                        </span>
                        {isSidebarOpen && (
                            <span className="label-wrapper">
                                <span className="folder-label">{folder.label}</span>
                                {folderKey === 'inbox' && (
                                    <span className="inbox-counter">{inboxCount}</span>
                                )}
                            </span>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
