export function MailFolderList({ filterBy, onSetFilter, isSidebarOpen, inboxCount }) {
    const folders = [
        { icon: 'inbox', label: 'Inbox' },
        { icon: 'star', label: 'Starred' },
        { icon: 'send', label: 'Sent' },
        { icon: 'draft', label: 'Draft' },
        { icon: 'delete', label: 'Trash' },
    ]

    return (
        <nav className="sidebar-nav">
            {folders.map(folder => {
                const isSelected = filterBy === folder.label.toLowerCase() || (folder.label === 'Inbox' && filterBy === 'all')
                return (
                    <div
                        key={folder.label}
                        className={`nav-item ${isSelected ? 'active' : ''}`}
                        onClick={() => onSetFilter(folder.label.toLowerCase())}
                    >
                        <span className="icon-wrapper">
                            <span className="material-symbols-outlined nav-icon">{folder.icon}</span>
                        </span>
                        {isSidebarOpen && (
    <span className="label-wrapper">
        <span className="folder-label">{folder.label}</span>
        {folder.label === 'Inbox' && (
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
