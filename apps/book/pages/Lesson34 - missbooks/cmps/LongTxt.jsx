const { useState } = React;

export function LongTxt({ txt, length = 100 }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const isTruncated = txt.length > length;
    const displayText = isExpanded ? txt : txt.slice(0, length);

    return (
        <p>
            {displayText}{isTruncated && !isExpanded && '...'}
            {isTruncated && (
                <button onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Read Less' : 'Read More'}
                </button>
            )}
        </p>
    );
} 