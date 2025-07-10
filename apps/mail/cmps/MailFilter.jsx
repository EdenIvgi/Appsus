// MailFilter.jsx
const { useState, useEffect } = React

export function MailFilter({ filterBy, onSetFilter, unreadCount, sortByDate }) {
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        onSetFilter(filterBy, searchTerm, sortByDate)
    }, [filterBy, searchTerm])

    function handleSearch(ev) {
        setSearchTerm(ev.target.value)
    }

    function toggleSortDirection() {
        const newSort = sortByDate === 'desc' ? 'asc' : 'desc'
        onSetFilter(filterBy, searchTerm, newSort)
    }

    return (
        <div className="mail-filters">
            <button
                className={`filter-btn ${filterBy === 'all' ? 'active' : ''}`}
                onClick={() => onSetFilter('all', searchTerm, sortByDate)}
            >
                All
            </button>

            {(filterBy !== 'sent' && filterBy !== 'draft') && (
                <button
                    className={`filter-btn ${filterBy === 'unread' ? 'active' : ''}`}
                    onClick={() => onSetFilter('unread', searchTerm, sortByDate)}
                >
                    Unread ({unreadCount})
                </button>
            )}
<button className="filter-btn date-sort-btn" onClick={toggleSortDirection}>
    Date
    <span className="material-symbols-outlined date-arrow-icon">
        {sortByDate === 'desc' ? 'arrow_downward' : 'arrow_upward'}
    </span>
</button>

        </div>
    )
}


