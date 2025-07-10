const { useState, useEffect } = React

import { noteService } from '../services/note.service.js'

export function LabelDisplay({ labelId, noteColor }) {
    const [label, setLabel] = useState(null)

    useEffect(() => {
        loadLabel()
    }, [labelId])

    function loadLabel() {
        noteService.getLabelById(labelId)
            .then(label => {
                setLabel(label)
            })
            .catch(err => {
                console.error('Error loading label:', err)
                setLabel(null)
            })
    }

    if (!label) return null

    // Use note color, but make it slightly darker for contrast
    const labelColor = noteColor && noteColor !== '#ffffff' ? 
        adjustColorBrightness(noteColor, -20) : '#5f6368'

    return (
        <span 
            className="note-label"
            style={{ backgroundColor: labelColor }}
        >
            {label.name}
        </span>
    )
}

// Helper function to adjust color brightness
function adjustColorBrightness(hexColor, amount) {
    // Remove # if present
    const color = hexColor.replace('#', '')
    
    // Parse RGB values
    const num = parseInt(color, 16)
    const r = Math.max(0, Math.min(255, (num >> 16) + amount))
    const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount))
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
    
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
} 