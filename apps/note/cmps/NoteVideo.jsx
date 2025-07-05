const { useState, useEffect } = React

export function NoteVideo({ info }) {
    const [videoError, setVideoError] = useState(false)
    const [videoLoading, setVideoLoading] = useState(true)
    const [embedUrl, setEmbedUrl] = useState('')

    useEffect(() => {
        if (info.url) {
            setVideoLoading(true)
            setVideoError(false)
            
            // Convert YouTube URL to embed format
            const convertedUrl = convertToEmbedUrl(info.url)
            if (convertedUrl) {
                setEmbedUrl(convertedUrl)
                setVideoLoading(false)
            } else {
                setVideoError(true)
                setVideoLoading(false)
            }
        }
    }, [info.url])

    function convertToEmbedUrl(url) {
        // Handle different YouTube URL formats
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

    function handleVideoError() {
        setVideoError(true)
        setVideoLoading(false)
    }

    function handleVideoLoad() {
        setVideoLoading(false)
        setVideoError(false)
    }

    return (
        <div className="note-video">
            {info.title && <h3>{info.title}</h3>}
            
            {info.url && (
                <div className="note-video-container">
                    {videoLoading && !videoError && (
                        <div className="video-loading">Loading video...</div>
                    )}
                    
                    {videoError ? (
                        <div className="video-error">
                            <span className="material-icons">videocam_off</span>
                            <span>Invalid YouTube URL</span>
                            <div className="video-url-display">{info.url}</div>
                        </div>
                    ) : embedUrl && (
                        <div className="video-wrapper">
                            <iframe
                                src={embedUrl}
                                title={info.title || 'YouTube video'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onError={handleVideoError}
                                onLoad={handleVideoLoad}
                                style={{ display: videoLoading ? 'none' : 'block' }}
                            />
                        </div>
                    )}
                </div>
            )}
            
            {info.txt && <p>{info.txt}</p>}
        </div>
    )
} 