const { useState, useEffect } = React

export function MailFilter({ filterBy, onSetFilter, unreadCount }) {
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        onSetFilter(filterBy, searchTerm)
    }, [filterBy, searchTerm])

    function handleSearch(ev) {
        setSearchTerm(ev.target.value)
    }

    return (
        <div className="mail-filters">
       
            <button
                className={`filter-btn ${filterBy === 'all' ? 'active' : ''}`}
                onClick={() => onSetFilter('all', searchTerm)}
            >
                All
            </button>

            {(filterBy !== 'sent' && filterBy !== 'draft') && (
                <button
                    className={`filter-btn ${filterBy === 'unread' ? 'active' : ''}`}
                    onClick={() => onSetFilter('unread', searchTerm)}
                >
                    Unread ({unreadCount})
                </button>
            )}
        </div>
    )
}
