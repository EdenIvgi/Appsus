
import { MailCompose } from '../cmps/MailCompose.jsx'
import { MailList } from '../cmps/MailList.jsx'
import { mailService } from '../services/mail.service.js'

const { useState, useEffect } = React

export function MailIndex() {
    const [isComposing, setIsComposing] = useState(false)
    const [mails, setMails] = useState([])
    const [filterBy, setFilterBy] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        mailService.query().then(setMails)
    }, [])

    const filteredMails = mails.filter((mail) => {
        const matchesSearch =
            mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mail.body.toLowerCase().includes(searchTerm.toLowerCase())

        if (filterBy === 'all') return matchesSearch
        if (filterBy === 'starred') return mail.isStarred && matchesSearch
        if (filterBy === 'unread') return !mail.isRead && matchesSearch
    })

    function updateMail(updatedMail) {
        setMails(prevMails =>
            prevMails.map(mail =>
                mail.id === updatedMail.id ? updatedMail : mail
            )
        )
        mailService.save(updatedMail)
    }

    function removeMail(mailId) {
        setMails(prevMails => prevMails.filter(mail => mail.id !== mailId))
        mailService.remove(mailId)
    }

    return (
        <section className="mail-index">
            <aside className="mail-sidebar">
            <button className="btn-compose" onClick={() => setIsComposing(true)}>
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
                    <div className="search-wrapper">
                        <span className="material-icons search-icon">search</span>
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search mail"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="mail-filters">
                        <button className={`filter-btn ${filterBy === 'all' ? 'active' : ''}`} onClick={() => setFilterBy('all')}>All</button>
                        <button className={`filter-btn ${filterBy === 'starred' ? 'active' : ''}`} onClick={() => setFilterBy('starred')}>Starred</button>
                        <button className={`filter-btn ${filterBy === 'unread' ? 'active' : ''}`} onClick={() => setFilterBy('unread')}>Unread</button>
                    </div>
                </div>
                {isComposing && (
    <MailCompose onClose={() => setIsComposing(false)} />
)}

                <MailList mails={filteredMails} onUpdate={updateMail} onRemove={removeMail} />
                
            </main>
        </section>
    )
}
