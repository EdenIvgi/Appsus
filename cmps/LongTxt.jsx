const { useState } = React

export function LongTxt({ txt, length = 100 }) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!txt || txt.length <= length) return <span>{txt}</span>

    const displayTxt = isExpanded ? txt : txt.substring(0, length) + '...'

    return (
        <span>
            {displayTxt}
            <button 
                className="btn-link" 
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? ' Show Less' : ' Read More'}
            </button>
        </span>
    )
} 