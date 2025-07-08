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
    const [unreadCount, setUnreadCount] = useState(0)


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

            const unread = mails.filter(mail => !mail.isRead)
            setUnreadCount(unread.length)
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

    function NavItem({ icon, label, selected, onClick }) {
        return (
            <div className={`nav-item ${selected ? 'active' : ''}`} onClick={onClick}>
                <span className="icon-wrapper">
                    <span className="material-symbols-outlined nav-icon">{icon}</span>
                </span>
                {isSidebarOpen && <span>{label}</span>}
            </div>
        )
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
                    {isSidebarOpen && <span> Compose</span>}
                </button>

                <nav className="sidebar-nav">
                    <NavItem icon="inbox" label="Inbox" selected={filterBy === 'all'} onClick={() => setFilterBy('all')} />
                    <NavItem icon="star" label="Starred" selected={filterBy === 'starred'} onClick={() => setFilterBy('starred')} />
                    <NavItem icon="send" label="Sent" selected={filterBy === 'sent'} onClick={() => setFilterBy('sent')} />
                    <NavItem icon="draft" label="Draft" selected={filterBy === 'draft'} onClick={() => setFilterBy('draft')} />
                    <NavItem icon="delete" label="Trash" selected={filterBy === 'trash'} onClick={() => setFilterBy('trash')} />
                </nav>
            </aside>

            <main className="mail-main">
                <div className="mail-controls">
                    <div className="mail-filters">
                        <button className={`filter-btn ${filterBy === 'all' ? 'active' : ''}`} onClick={() => setFilterBy('all')}>All</button>
                        <button className={`filter-btn ${filterBy === 'starred' ? 'active' : ''}`} onClick={() => setFilterBy('starred')}>Starred</button>
                        <button
    className={`filter-btn ${filterBy === 'unread' ? 'active' : ''}`}
    onClick={() => setFilterBy('unread')}
>
    Unread ({unreadCount})
</button>
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
