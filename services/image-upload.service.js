import { utilService } from './util.service.js'

export const imageUploadService = {
    uploadImage,
    generateImageUrl
}

function uploadImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No file provided')
            return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            reject('Please select an image file')
            return
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            reject('Image file is too large. Please select a file smaller than 5MB.')
            return
        }

        const reader = new FileReader()
        
        reader.onload = function(e) {
            const imageData = e.target.result
            const filename = generateUniqueFilename(file.name)
            const imageUrl = `assets/img/${filename}`
            
            // Store image data in localStorage for demo purposes
            // In a real app, this would upload to a server
            storeImageData(filename, imageData)
            
            resolve({
                url: imageUrl,
                filename: filename,
                originalName: file.name,
                size: file.size
            })
        }
        
        reader.onerror = function() {
            reject('Error reading file')
        }
        
        reader.readAsDataURL(file)
    })
}

function generateUniqueFilename(originalName) {
    const timestamp = Date.now()
    const randomId = utilService.makeId(4)
    const extension = originalName.split('.').pop()
    return `img_${timestamp}_${randomId}.${extension}`
}

function generateImageUrl(filename) {
    return `assets/img/${filename}`
}

function storeImageData(filename, dataUrl) {
    // Store the image data in localStorage for demo purposes
    // This simulates saving the file to the assets/img directory
    const imageStore = JSON.parse(localStorage.getItem('imageStore') || '{}')
    imageStore[filename] = dataUrl
    localStorage.setItem('imageStore', JSON.stringify(imageStore))
}

// Function to get stored image data (useful for development)
function getStoredImageData(filename) {
    const imageStore = JSON.parse(localStorage.getItem('imageStore') || '{}')
    return imageStore[filename]
} 