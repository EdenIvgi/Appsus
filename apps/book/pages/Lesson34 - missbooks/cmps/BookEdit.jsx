const { useState, useEffect, useRef } = React;
const { useParams, useNavigate } = ReactRouterDOM;
import { bookService } from '../services/bookService.js';
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js';

export function BookEdit() {
    const [bookToEdit, setBookToEdit] = useState(bookService.getEmptyBook());
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const debounceRef = useRef();
    const navigate = useNavigate();
    const { bookId } = useParams();

    useEffect(() => {
        if (bookId) {
            bookService.get(bookId)
                .then(setBookToEdit)
                .catch(err => console.log('err:', err));
        }
    }, [bookId]);

    function handleChange({ target }) {
        const { name, value, type, checked } = target;
        let val = type === 'number' ? +value : value;
        
        if (type === 'checkbox') {
            val = checked;
        }

        if (name === 'authors' || name === 'categories') {
            val = val.split(',').map(s => s.trim());
        }

        setBookToEdit(prevBook => {
            if (name === 'amount' || name === 'currencyCode' || name === 'isOnSale') {
                const listPrice = { ...prevBook.listPrice, [name]: val };
                return { ...prevBook, listPrice };
            }
            return { ...prevBook, [name]: val };
        });
    }

    function onSaveBook(ev) {
        ev.preventDefault();
        bookService.save(bookToEdit)
            .then(() => {
                const action = bookId ? 'updated' : 'added';
                showSuccessMsg(`Book ${action} successfully!`);
                navigate('/book');
            })
            .catch(err => {
                console.log('err:', err);
                showErrorMsg('Failed to save book');
            });
    }

    // Google Books search integration (only for adding new book)
    function onSearchChange(ev) {
        const value = ev.target.value;
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (value) {
                bookService.getBooksFromGoogle(value)
                    .then(res => setResults(res))
                    .catch(() => setResults([]));
            } else {
                setResults([]);
            }
        }, 500);
    }

    function onSelectGoogleBook(googleBook) {
        const mapped = bookService.mapGoogleBookToAppBook(googleBook);
        setBookToEdit(mapped);
        setSearch(mapped.title);
        setResults([]);
    }

    const { title, subtitle, authors, publishedDate, description, pageCount, categories, language, listPrice } = bookToEdit;

    return (
        <section className="book-edit">
            <h2>{bookId ? 'Edit' : 'Add'} Book</h2>
            <form onSubmit={onSaveBook} autoComplete="off">
                {!bookId && (
                    <div style={{ position: 'relative', marginBottom: '1em' }}>
                        <label htmlFor="google-search">Search Google Books</label>
                        <input
                            type="text"
                            id="google-search"
                            placeholder="Type a book name..."
                            value={search}
                            onChange={onSearchChange}
                            style={{ width: '100%', fontSize: '1.1em' }}
                        />
                        {results.length > 0 && (
                            <ul style={{
                                position: 'absolute',
                                zIndex: 10,
                                background: 'white',
                                border: '1px solid #ccc',
                                width: '100%',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                margin: 0,
                                padding: 0,
                                listStyle: 'none',
                            }}>
                                {results.map(book => (
                                    <li key={book.id} style={{ padding: '0.5em', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                        onClick={() => onSelectGoogleBook(book)}>
                                        {book.volumeInfo.title}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                <label htmlFor="title">Title</label>
                <input type="text" id="title" name="title" value={title || ''} onChange={handleChange} />

                <label htmlFor="subtitle">Subtitle</label>
                <input type="text" id="subtitle" name="subtitle" value={subtitle || ''} onChange={handleChange} />

                <label htmlFor="authors">Authors (comma-separated)</label>
                <input type="text" id="authors" name="authors" value={authors ? authors.join(', ') : ''} onChange={handleChange} />

                <label htmlFor="publishedDate">Published Date</label>
                <input type="number" id="publishedDate" name="publishedDate" value={publishedDate || ''} onChange={handleChange} />

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={description || ''} onChange={handleChange} />

                <label htmlFor="pageCount">Page Count</label>
                <input type="number" id="pageCount" name="pageCount" value={pageCount || ''} onChange={handleChange} />

                <label htmlFor="categories">Categories (comma-separated)</label>
                <input type="text" id="categories" name="categories" value={categories ? categories.join(', ') : ''} onChange={handleChange} />

                <label htmlFor="language">Language</label>
                <input type="text" id="language" name="language" value={language || ''} onChange={handleChange} />

                <div className="price-section">
                    <label htmlFor="amount">Price</label>
                    <input type="number" id="amount" name="amount" value={listPrice ? listPrice.amount : ''} onChange={handleChange} />

                    <label htmlFor="currencyCode">Currency</label>
                    <select id="currencyCode" name="currencyCode" value={listPrice ? listPrice.currencyCode : 'USD'} onChange={handleChange}>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="ILS">ILS (₪)</option>
                        <option value="GBP">GBP (£)</option>
                    </select>
                </div>

                <div className="sale-section">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox" 
                            name="isOnSale" 
                            checked={listPrice ? listPrice.isOnSale : false} 
                            onChange={handleChange}
                        />
                        <span className="checkmark"></span>
                        On Sale
                    </label>
                </div>

                <div className="form-actions">
                    <button type="submit">{bookId ? 'Save' : 'Add'}</button>
                    <button type="button" onClick={() => navigate('/book')}>Back</button>
                </div>
            </form>
        </section>
    );
} 