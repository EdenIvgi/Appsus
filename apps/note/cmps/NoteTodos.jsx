const { useState } = React

export function NoteTodos({ info, onUpdate, isEditable = false }) {
    const [todos, setTodos] = useState(info.todos || [])
    const [title, setTitle] = useState(info.title || '')
    const [newTodoText, setNewTodoText] = useState('')

    function handleTodoToggle(idx, event) {
        // Prevent the click from bubbling up to parent elements (like opening the editor)
        if (event) {
            event.stopPropagation()
        }
        
        // Allow checkbox toggling in both preview and edit modes
        const updatedTodos = todos.map((todo, i) => 
            i === idx 
                ? { ...todo, doneAt: todo.doneAt ? null : Date.now() }
                : todo
        )
        setTodos(updatedTodos)
        if (onUpdate) {
            onUpdate({ title, todos: updatedTodos })
        }
    }

    function handleAddTodo() {
        if (!isEditable) return
        
        // If there's text in the input, add it. Otherwise, add empty item
        const todoText = newTodoText.trim() || ''
        const newTodo = { txt: todoText, doneAt: null }
        const updatedTodos = [...todos, newTodo]
        setTodos(updatedTodos)
        setNewTodoText('')
        if (onUpdate) {
            onUpdate({ title, todos: updatedTodos })
        }
    }

    function handleAddTodoAfter(idx) {
        if (!isEditable) return
        
        const newTodo = { txt: '', doneAt: null }
        const updatedTodos = [
            ...todos.slice(0, idx + 1),
            newTodo,
            ...todos.slice(idx + 1)
        ]
        setTodos(updatedTodos)
        if (onUpdate) {
            onUpdate({ title, todos: updatedTodos })
        }
        
        // Focus the new input after a short delay
        setTimeout(() => {
            const inputs = document.querySelectorAll('.todo-text-input')
            if (inputs[idx + 1]) {
                inputs[idx + 1].focus()
            }
        }, 50)
    }

    function handleTodoTextChange(idx, newText) {
        if (!isEditable) return
        
        const updatedTodos = todos.map((todo, i) => 
            i === idx ? { ...todo, txt: newText } : todo
        )
        setTodos(updatedTodos)
        if (onUpdate) {
            onUpdate({ title, todos: updatedTodos })
        }
    }

    function handleTitleChange(newTitle) {
        setTitle(newTitle)
        if (onUpdate) {
            onUpdate({ title: newTitle, todos })
        }
    }

    function handleDeleteTodo(idx) {
        if (!isEditable) return
        
        const updatedTodos = todos.filter((_, i) => i !== idx)
        setTodos(updatedTodos)
        if (onUpdate) {
            onUpdate({ title, todos: updatedTodos })
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            handleAddTodo()
        }
    }

    function handleTodoKeyPress(e, idx) {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            handleAddTodoAfter(idx)
        }
    }

    return (
        <div className="note-todos">
            {isEditable ? (
                <input 
                    type="text"
                    className="todo-title-input"
                    placeholder="List title"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                title && <h3>{title}</h3>
            )}
            
            <ul className="todo-list">
                {todos.map((todo, idx) => (
                    <li key={idx} className={`todo-item ${todo.doneAt ? 'done' : ''}`}>
                        <input 
                            type="checkbox" 
                            checked={!!todo.doneAt} 
                            onChange={(e) => {
                                e.stopPropagation()
                                handleTodoToggle(idx, e)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="todo-checkbox"
                        />
                        {isEditable ? (
                            <input
                                type="text"
                                className="todo-text-input"
                                value={todo.txt}
                                onChange={(e) => handleTodoTextChange(idx, e.target.value)}
                                onKeyPress={(e) => handleTodoKeyPress(e, idx)}
                                placeholder="List item"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span className="todo-text">{todo.txt}</span>
                        )}
                        {isEditable && (
                            <button 
                                className="todo-delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteTodo(idx)
                                }}
                                title="Delete item"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            
            {/* Show placeholder for empty lists in preview mode */}
            {!isEditable && todos.length === 0 && !title && (
                <div className="empty-todo-placeholder">
                    <span className="material-symbols-outlined">checklist</span>
                    <span>Empty list</span>
                </div>
            )}
            
            {isEditable && (
                <div className="add-todo-container" onClick={(e) => e.stopPropagation()}>
                    <span 
                        className="material-symbols-outlined add-icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleAddTodo()
                        }}
                        style={{ cursor: 'pointer' }}
                    >add</span>
                    <input
                        type="text"
                        className="add-todo-input"
                        placeholder="List item"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    )
} 