const { useState, useEffect } = React

import { mailService } from '../services/mail.service.js'
import { MailList } from '../cmps/MailList.jsx'
import { MailCompose } from '../cmps/MailCompose.jsx'

export function MailIndex() {
    const [isComposing, setIsComposing] = useState(false)
    const [mails, setMails] = useState([])
    const [filterBy, setFilterBy] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedMailId, setExpandedMailId] = useState(null)


    useEffect(() => {
        mailService.query({ status: 'inbox' }).then(mails => {
            setMails(mails)
            console.log('Loaded mails:', mails)
        })
    }, [filterBy])

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

    function addMail(newMail) {
        mailService.save(newMail).then((saved) => {
            setMails(prev => [saved, ...prev])
        })
    }

    function onExpand(mail) {
        setExpandedMailId(prevId => (prevId === mail.id ? null : mail.id))
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
                    <MailCompose
                        onClose={() => setIsComposing(false)}
                        onSend={addMail}
                    />
                )}

                <MailList
                    mails={filteredMails}
                    onUpdate={updateMail}
                    onRemove={removeMail}
                    onExpand={onExpand}
                    expandedMailId={expandedMailId}
                />
            </main>
        </section>
    )
}
