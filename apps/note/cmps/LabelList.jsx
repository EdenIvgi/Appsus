const { useState, useEffect } = React

import { noteService } from '../services/note.service.js'

export function LabelList({ onLabelFilter, activeLabelFilter }) {
    const [labels, setLabels] = useState([])

    useEffect(() => {
        loadLabels()
    }, [])

    function loadLabels() {
        noteService.getLabels()
            .then(labels => {
                setLabels(labels)
            })
            .catch(err => console.error('Error loading labels:', err))
    }

    if (!labels || labels.length === 0) {
        return null
    }

    function handleLabelClick(labelId) {
        if (onLabelFilter) {
            onLabelFilter(labelId)
        }
    }

    return (
        <div className="sidebar-labels">
            {labels.map(label => (
                <div 
                    key={label.id} 
                    className={`sidebar-label-item nav-item ${activeLabelFilter === label.id ? 'active' : ''}`}
                    onClick={() => handleLabelClick(label.id)}
                >
                    <span className="material-symbols-outlined label-icon">label</span>
                    <span className="nav-text">{label.name}</span>
                </div>
            ))}
        </div>
    )
} 