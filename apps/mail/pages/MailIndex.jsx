const { useState, useEffect } = React
import { MailList } from '../cmps/MailList.jsx'
import { mailService } from '../services/mail.service.js'

export function MailIndex() {
    const [mails, setMails] = useState([])
    const [filterBy, setFilterBy] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadMails()
    }, [filterBy, searchTerm])

    function loadMails() {
        mailService.query().then((mails) => {
            const filtered = mails.filter((mail) => {
                const matchesSearch =
                    mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mail.body.toLowerCase().includes(searchTerm.toLowerCase())

                if (filterBy === 'all') return matchesSearch
                if (filterBy === 'starred') return mail.isStarred && matchesSearch
                if (filterBy === 'unread') return !mail.isRead && matchesSearch
            })
            setMails(filtered)
        })
    }

    return (
        <section className="mail-index">
            <aside className="mail-sidebar">
                <button className="btn-compose">
                    <span className="material-icons">edit</span>
                    Compose
                </button>
                <nav className="sidebar-nav">
                    <div className="nav-item active">
                        <span className="material-icons nav-icon">inbox</span>
                        <span>Inbox</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">star</span>
                        <span>Starred</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">send</span>
                        <span>Sent</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">drafts</span>
                        <span>Draft</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">delete</span>
                        <span>Trash</span>
                    </div>
                </nav>
            </aside>

            <main className="mail-main">
                <div className="mail-controls">
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="mail-filters">
                        <button
                            className={`filter-btn ${filterBy === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterBy('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filterBy === 'starred' ? 'active' : ''}`}
                            onClick={() => setFilterBy('starred')}
                        >
                            Starred
                        </button>
                        <button
                            className={`filter-btn ${filterBy === 'unread' ? 'active' : ''}`}
                            onClick={() => setFilterBy('unread')}
                        >
                            Unread
                        </button>
                    </div>
                </div>

                <MailList mails={mails} onUpdate={loadMails} />
            </main>
        </section>
    )
}
