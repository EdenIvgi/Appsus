const { useState } = React

export function VideoUrlInput({ onSave, onCancel }) {
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [error, setError] = useState('')
    const [isValidUrl, setIsValidUrl] = useState(false)

    function convertToEmbedUrl(url) {
        if (!url) return null
        
        // YouTube regular URL: https://www.youtube.com/watch?v=VIDEO_ID
        let match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`
        }
        
        // YouTube short URL: https://youtu.be/VIDEO_ID
        match = url.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/)
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`
        }
        
        // Already embed URL
        if (url.includes('youtube.com/embed/')) {
            return url
        }
        
        return null
    }

    function handleUrlChange(e) {
        const inputUrl = e.target.value
        setUrl(inputUrl)
        
        if (inputUrl.trim()) {
            const embedUrl = convertToEmbedUrl(inputUrl)
            if (embedUrl) {
                setIsValidUrl(true)
                setError('')
            } else {
                setIsValidUrl(false)
                setError('Please enter a valid YouTube URL')
            }
        } else {
            setIsValidUrl(false)
            setError('')
        }
    }

    function handleSave() {
        if (!url.trim()) {
            setError('Please enter a YouTube URL')
            return
        }
        
        if (!isValidUrl) {
            setError('Please enter a valid YouTube URL')
            return
        }

        onSave({
            url: url.trim(),
            title: title.trim() || ''
        })
    }

    function handleCancel() {
        onCancel()
    }

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            handleCancel()
        }
    }

    return (
        <div className="video-url-input-backdrop" onClick={handleBackdropClick}>
            <div className="video-url-input-modal">
                <div className="video-url-input-header">
                    <h3>Add YouTube Video</h3>
                    <button className="close-btn" onClick={handleCancel}>
                        <span className="material-icons">close</span>
                    </button>
                </div>
                
                <div className="video-url-input-content">
                    <div className="input-group">
                        <label htmlFor="video-title">Title (optional)</label>
                        <input
                            id="video-title"
                            type="text"
                            placeholder="Enter video title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="video-title-input"
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="video-url">YouTube URL *</label>
                        <input
                            id="video-url"
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={handleUrlChange}
                            className={`video-url-input ${error ? 'error' : ''} ${isValidUrl ? 'valid' : ''}`}
                            autoFocus
                        />
                        {error && <div className="error-message">{error}</div>}
                        {isValidUrl && (
                            <div className="success-message">
                                <span className="material-icons">check_circle</span>
                                Valid YouTube URL
                            </div>
                        )}
                    </div>
                    
                    <div className="url-examples">
                        <div className="examples-title">Supported formats:</div>
                        <div className="example-url">https://www.youtube.com/watch?v=VIDEO_ID</div>
                        <div className="example-url">https://youtu.be/VIDEO_ID</div>
                    </div>
                </div>
                
                <div className="video-url-input-actions">
                    <button className="btn-cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button 
                        className="btn-save" 
                        onClick={handleSave}
                        disabled={!isValidUrl}
                    >
                        Add Video
                    </button>
                </div>
            </div>
        </div>
    )
} 