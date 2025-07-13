const { useState, useRef } = React;
import { bookService } from '../services/bookService.js';
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js';

export function BookAdd() {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const debounceRef = useRef();

    function onChange(ev) {
        const value = ev.target.value;
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (value) {
                bookService.getBooksFromGoogleMod(value)
                    .then(res => {
                        setResults(res);
                        console.log('Google Books results:', res);
                    })
                    .catch((err) => {
                        setResults([]);
                        console.error('Google Books error:', err);
                    });
            } else {
                setResults([]);
            }
        }, 500);
    }

    function onAdd(book) {
        bookService.addGoogleBook(book)
            .then(() => showSuccessMsg('Book added!'))
            .catch(() => showErrorMsg('Book already exists!'));
    }

    function onClear() {
        setSearch('');
        setResults([]);
    }

    return (
        <section style={{ maxWidth: '400px', margin: '2em auto', fontFamily: 'serif' }}>
            <h2>Add Book from Google</h2>
            <div style={{ position: 'relative', marginBottom: '1em' }}>
                <input
                    type="text"
                    placeholder="Search for a book..."
                    value={search}
                    onChange={onChange}
                    style={{ width: '100%', paddingRight: '2em', fontSize: '1.1em' }}
                />
                {search && (
                    <button
                        onClick={onClear}
                        style={{
                            position: 'absolute',
                            right: '0.2em',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.2em',
                            cursor: 'pointer',
                            color: '#888'
                        }}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>
            <ul style={{ listStyle: 'disc inside', padding: 0 }}>
                {results.map(book => (
                    <li key={book.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
                        <span style={{ flex: 1 }}>{book.title}</span>
                        <button
                            onClick={() => onAdd(book)}
                            style={{
                                marginLeft: '0.5em',
                                borderRadius: '50%',
                                width: '2em',
                                height: '2em',
                                border: '1px solid #888',
                                background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
                                fontWeight: 'bold',
                                fontSize: '1.2em',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                            title="Add book"
                        >
                            +
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
} 