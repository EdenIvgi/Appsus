const { useState, useEffect, useRef } = React

import { noteService } from '../services/note.service.js'

function LabelEditor({ onClose }) {
    const [labels, setLabels] = useState([])
    const [newLabelName, setNewLabelName] = useState('')
    const [editingLabelId, setEditingLabelId] = useState(null)
    const [editingLabelName, setEditingLabelName] = useState('')
    const newLabelInputRef = useRef(null)
    const editInputRef = useRef(null)

    useEffect(() => {
        loadLabels()
    }, [])

    useEffect(() => {
        if (editingLabelId && editInputRef.current) {
            editInputRef.current.focus()
            editInputRef.current.select()
        }
    }, [editingLabelId])

    function loadLabels() {
        noteService.getLabels()
            .then(labels => {
                setLabels(labels)
            })
            .catch(err => console.error('Error loading labels:', err))
    }

    function handleCreateLabel() {
        if (!newLabelName.trim()) return

        const newLabel = {
            name: newLabelName.trim()
        }

        noteService.saveLabel(newLabel)
            .then(savedLabel => {
                setLabels(prev => [...prev, savedLabel])
                setNewLabelName('')
                if (newLabelInputRef.current) {
                    newLabelInputRef.current.focus()
                }
            })
            .catch(err => console.error('Error creating label:', err))
    }

    function handleEditLabel(labelId, newName) {
        if (!newName.trim()) return

        const labelToUpdate = labels.find(label => label.id === labelId)
        if (!labelToUpdate) return

        const updatedLabel = {
            ...labelToUpdate,
            name: newName.trim()
        }

        noteService.saveLabel(updatedLabel)
            .then(savedLabel => {
                setLabels(prev => prev.map(label => 
                    label.id === labelId ? savedLabel : label
                ))
                setEditingLabelId(null)
                setEditingLabelName('')
            })
            .catch(err => console.error('Error updating label:', err))
    }

    function handleDeleteLabel(labelId) {
        noteService.removeLabel(labelId)
            .then(() => {
                setLabels(prev => prev.filter(label => label.id !== labelId))
            })
            .catch(err => console.error('Error deleting label:', err))
    }

    function startEditing(label) {
        setEditingLabelId(label.id)
        setEditingLabelName(label.name)
    }

    function cancelEditing() {
        setEditingLabelId(null)
        setEditingLabelName('')
    }



    function handleKeyDown(e, action) {
        if (e.key === 'Enter') {
            action()
        } else if (e.key === 'Escape') {
            if (editingLabelId) {
                cancelEditing()
            }
        }
    }

    return (
        <div className="label-editor-backdrop">
            <div className="label-editor-modal">
                <div className="label-editor-header">
                    <h3>Edit labels</h3>
                    <button className="btn-close-editor" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="label-editor-content">
                    {/* Create new label */}
                    <div className="create-label-container">
                        <button 
                            className="btn-create-action"
                            onClick={handleCreateLabel}
                            disabled={!newLabelName.trim()}
                        >
                            <span className="material-symbols-outlined">
                                {newLabelName.trim() ? 'check' : 'add'}
                            </span>
                        </button>
                        <input
                            ref={newLabelInputRef}
                            type="text"
                            className="create-label-input"
                            placeholder="Create new label"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, handleCreateLabel)}
                        />
                        {newLabelName.trim() && (
                            <button 
                                className="btn-cancel-create"
                                onClick={() => {
                                    setNewLabelName('')
                                    if (newLabelInputRef.current) {
                                        newLabelInputRef.current.focus()
                                    }
                                }}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>

                    {/* Existing labels */}
                    <div className="existing-labels">
                        {labels.map(label => (
                            <div key={label.id} className="label-edit-item">
                                <span className="material-symbols-outlined label-icon">label</span>
                                
                                {editingLabelId === label.id ? (
                                    React.createElement(React.Fragment, null,
                                        React.createElement('input', {
                                            ref: editInputRef,
                                            type: 'text',
                                            className: 'edit-label-input',
                                            value: editingLabelName,
                                            onChange: (e) => setEditingLabelName(e.target.value),
                                            onKeyDown: (e) => handleKeyDown(e, () => handleEditLabel(label.id, editingLabelName)),
                                            onBlur: () => handleEditLabel(label.id, editingLabelName)
                                        }),
                                        React.createElement('button', {
                                            className: 'btn-save-edit',
                                            onClick: () => handleEditLabel(label.id, editingLabelName)
                                        }, React.createElement('span', { className: 'material-symbols-outlined' }, 'check')),
                                        React.createElement('button', {
                                            className: 'btn-cancel-edit',
                                            onClick: cancelEditing
                                        }, React.createElement('span', { className: 'material-symbols-outlined' }, 'close'))
                                    )
                                ) : (
                                    React.createElement(React.Fragment, null,
                                        React.createElement('span', { className: 'label-name-display' }, label.name),
                                        React.createElement('button', {
                                            className: 'btn-edit-label',
                                            onClick: () => startEditing(label),
                                            title: 'Edit label'
                                        }, React.createElement('span', { className: 'material-symbols-outlined' }, 'edit')),
                                        React.createElement('button', {
                                            className: 'btn-delete-label',
                                            onClick: () => handleDeleteLabel(label.id),
                                            title: 'Delete label'
                                        }, React.createElement('span', { className: 'material-symbols-outlined' }, 'delete'))
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="label-editor-actions">
                    <button className="btn-done" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}

export { LabelEditor }