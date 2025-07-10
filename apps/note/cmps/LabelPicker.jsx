const { useState, useEffect } = React

import { noteService } from '../services/note.service.js'

export function LabelPicker({ selectedLabels = [], onLabelsChange, onClose, onMouseEnter, onMouseLeave }) {
    const [labels, setLabels] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

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

    function onToggleLabel(labelId) {
        const isSelected = selectedLabels.includes(labelId)
        let updatedLabels
        
        if (isSelected) {
            updatedLabels = selectedLabels.filter(id => id !== labelId)
        } else {
            updatedLabels = [...selectedLabels, labelId]
        }
        
        onLabelsChange(updatedLabels)
    }

    const filteredLabels = labels.filter(label => 
        label.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div 
            className="label-picker-popup"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="label-picker-header">
                <h3>Label note</h3>
                <button className="btn-close-label-picker" onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <div className="label-search-container">
                <span className="material-symbols-outlined search-icon">search</span>
                <input
                    type="text"
                    className="label-search-input"
                    placeholder="Enter label name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="label-list">
                {filteredLabels.map(label => (
                    <div key={label.id} className="label-item">
                        <button 
                            className={`label-checkbox ${selectedLabels.includes(label.id) ? 'checked' : ''}`}
                            onClick={() => onToggleLabel(label.id)}
                        >
                            <span className="material-symbols-outlined">
                                {selectedLabels.includes(label.id) ? 'check_box' : 'check_box_outline_blank'}
                            </span>
                        </button>
                        <span className="material-symbols-outlined label-icon">label</span>
                        <span className="label-name">{label.name}</span>
                    </div>
                ))}
            </div>

            <div className="label-picker-actions">
                <button className="btn-done" onClick={onClose}>
                    Done
                </button>
            </div>
        </div>
    )
} 