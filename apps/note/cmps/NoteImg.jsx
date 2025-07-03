const { useState, useEffect } = React

export function NoteImg({ info }) {
    const [imageError, setImageError] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)
    const [imageSrc, setImageSrc] = useState('')

    useEffect(() => {
        if (info.url) {
            setImageLoading(true)
            setImageError(false)
            
            // Check if it's a stored image (starts with assets/img/)
            if (info.url.startsWith('assets/img/')) {
                const filename = info.url.split('/').pop()
                const imageStore = JSON.parse(localStorage.getItem('imageStore') || '{}')
                const storedImage = imageStore[filename]
                
                if (storedImage) {
                    setImageSrc(storedImage)
                    setImageLoading(false)
                } else {
                    // If not found in storage, show error
                    setImageError(true)
                    setImageLoading(false)
                    setImageSrc('')
                }
            } else {
                // External URL - let the image load normally
                setImageSrc(info.url)
            }
        }
    }, [info.url])

    function handleImageError() {
        setImageError(true)
        setImageLoading(false)
    }

    function handleImageLoad() {
        setImageLoading(false)
        setImageError(false)
    }

    return (
        <div className="note-img">
            {info.title && <h3>{info.title}</h3>}
            
            {info.url && (
                <div className="note-img-container">
                    {imageLoading && !imageError && (
                        <div className="image-loading">Loading image...</div>
                    )}
                    
                    {imageError ? (
                        <div className="image-error">
                            <span className="material-icons">broken_image</span>
                            <span>Image could not be loaded</span>
                        </div>
                    ) : imageSrc && (
                        <img 
                            src={imageSrc} 
                            alt={info.title || 'Note image'}
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                            style={{ display: imageLoading ? 'none' : 'block' }}
                        />
                    )}
                </div>
            )}
            
            {info.txt && <p>{info.txt}</p>}
        </div>
    )
} 