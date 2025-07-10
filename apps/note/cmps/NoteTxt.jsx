const { useState } = React

export function NoteTxt({ info, isPreview = true }) {
    const [isExpanded, setIsExpanded] = useState(false)
    
    // Character limit for truncation (Google Keep uses around 250-300 chars)
    const CHAR_LIMIT = 280
    
    const text = info.txt || ''
    const shouldTruncate = isPreview && text.length > CHAR_LIMIT
    
    function toggleExpanded(e) {
        e.stopPropagation() // Prevent note click when toggling
        setIsExpanded(!isExpanded)
    }
    
    const displayText = shouldTruncate && !isExpanded 
        ? text.slice(0, CHAR_LIMIT).trim() + '...'
        : text
    
    return (
        <div className="note-txt">
            {info.title && <h3>{info.title}</h3>}
            <p className={`note-text ${shouldTruncate ? 'truncatable' : ''}`}>
                {displayText}
                {shouldTruncate && (
                    <button 
                        className="text-toggle-btn"
                        onClick={toggleExpanded}
                        title={isExpanded ? 'Show less' : 'Show more'}
                    >
                        {isExpanded ? ' Show less' : ' Show more'}
                    </button>
                )}
            </p>
        </div>
    )
} 