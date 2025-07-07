const { useState, useEffect } = React
import { GmailHeader } from '../cmps/GmailHeader.jsx'
import { mailService } from '../services/mail.service.js'
import { MailList } from '../cmps/MailList.jsx'
import { MailCompose } from '../cmps/MailCompose.jsx'

export function MailIndex() {
    const [isComposing, setIsComposing] = useState(false)
    const [mails, setMails] = useState([])
    const [filterBy, setFilterBy] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedMailId, setExpandedMailId] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    useEffect(() => {
        loadMails()
    }, [filterBy, searchTerm])

    function loadMails() {
        let status = filterBy
        if (filterBy === 'all' || filterBy === 'starred' || filterBy === 'unread') {
            status = 'inbox'
        }

        mailService.query({ status }).then(mails => {
            const filtered = mails.filter(mail => {
                const matchesSearch =
                    mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mail.body.toLowerCase().includes(searchTerm.toLowerCase())

                if (filterBy === 'all') return matchesSearch
                if (filterBy === 'starred') return mail.isStarred && matchesSearch
                if (filterBy === 'unread') return !mail.isRead && matchesSearch
                return matchesSearch
            })

            setMails(filtered)
        })
    }

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
        mailService.save(newMail).then(saved => {
            const matchesFilter = () => {
                if (filterBy === 'sent') return saved.from === mailService.getLoggedinUser().email
                if (filterBy === 'inbox' || filterBy === 'all') return saved.to === mailService.getLoggedinUser().email
                return false
            }

            if (matchesFilter()) {
                setMails(prev => [saved, ...prev])
            }
        })
    }

    function onExpand(mail) {
        setExpandedMailId(prevId => (prevId === mail.id ? null : mail.id))
    }

    function toggleSidebar() {
        setIsSidebarOpen(prev => !prev)
    }

    return (
        <section className={`mail-index ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <GmailHeader
                searchTerm={searchTerm}
                onSearch={val => setSearchTerm(val)}
                onToggleSidebar={toggleSidebar}
            />

            <aside className={`mail-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <button className="btn-compose" onClick={() => setIsComposing(true)}>
                    <span className="material-symbols-outlined">edit</span>
                    {isSidebarOpen && <span>Compose</span>}
                </button>

                <nav className="sidebar-nav">
                    <div
                        className={`nav-item ${filterBy === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterBy('all')}
                    >
                        <span className="material-symbols-outlined nav-icon">inbox</span>
                        {isSidebarOpen && <span>Inbox</span>}
                    </div>
                    <div
                        className={`nav-item ${filterBy === 'starred' ? 'active' : ''}`}
                        onClick={() => setFilterBy('starred')}
                    >
                        <span className="material-symbols-outlined nav-icon">star</span>
                        {isSidebarOpen && <span>Starred</span>}
                    </div>
                    <div
                        className={`nav-item ${filterBy === 'sent' ? 'active' : ''}`}
                        onClick={() => setFilterBy('sent')}
                    >
                        <span className="material-symbols-outlined nav-icon">send</span>
                        {isSidebarOpen && <span>Sent</span>}
                    </div>
                    <div
                        className={`nav-item ${filterBy === 'draft' ? 'active' : ''}`}
                        onClick={() => setFilterBy('draft')}
                    >
                        <span className="material-symbols-outlined nav-icon">draft</span>
                        {isSidebarOpen && <span>Draft</span>}
                    </div>
                    <div
                        className={`nav-item ${filterBy === 'trash' ? 'active' : ''}`}
                        onClick={() => setFilterBy('trash')}
                    >
                        <span className="material-symbols-outlined nav-icon">delete</span>
                        {isSidebarOpen && <span>Trash</span>}
                    </div>
                </nav>
            </aside>

            <main className="mail-main">
                <div className="mail-controls">
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
                    mails={mails}
                    onUpdate={updateMail}
                    onRemove={removeMail}
                    onExpand={onExpand}
                    expandedMailId={expandedMailId}
                />
            </main>
        </section>
    )
}
