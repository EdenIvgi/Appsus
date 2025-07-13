const { Link } = ReactRouterDOM;

import { BookPreview } from './BookPreview.jsx';

export function BookList({ books, onRemoveBook }) {
    return (
        <ul className="book-list">
            {books.map(book =>
                <li key={book.id}>
                    <Link to={`/book/${book.id}`}>
                        <BookPreview book={book} />
                    </Link>
                    <div className="actions">
                        <Link to={`/book/${book.id}`}><button className="details-btn">Details</button></Link>
                        <button className="remove-btn" onClick={() => onRemoveBook(book.id)}>Remove</button>
                        <Link to={`/book/edit/${book.id}`}><button className="edit-btn">Edit</button></Link>
                    </div>
                </li>
            )}
        </ul>
    );
} 