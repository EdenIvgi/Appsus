export function NoteTodos({ info }) {
    return (
        <div className="note-todos">
            {info.title && <h3>{info.title}</h3>}
            <ul>
                {info.todos && info.todos.map((todo, idx) => (
                    <li key={idx} className={todo.doneAt ? 'done' : ''}>
                        <input 
                            type="checkbox" 
                            checked={!!todo.doneAt} 
                            readOnly 
                        />
                        <span>{todo.txt}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
} 