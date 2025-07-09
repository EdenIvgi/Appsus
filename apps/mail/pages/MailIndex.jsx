const { useState, useEffect } = React
import { GmailHeader } from '../cmps/GmailHeader.jsx'
import { mailService } from '../services/mail.service.js'
import { MailList } from '../cmps/MailList.jsx'
import { MailCompose } from '../cmps/MailCompose.jsx'
import { MailFolderList } from '../cmps/MailFolderList.jsx'

export function MailIndex() {
    const [isComposing, setIsComposing] = useState(false)
    const [mails, setMails] = useState([])
    const [filterBy, setFilterBy] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedMailId, setExpandedMailId] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const [inboxCount, setInboxCount] = useState(0)

    useEffect(() => {
        loadMails()
    }, [filterBy, searchTerm])

    function loadMails() {
        let status = filterBy
        if (filterBy === 'all' || filterBy === 'unread') {
            status = 'inbox'
        }

        mailService.query({ status }).then(allMails => {
            const filtered = allMails.filter(mail => {
                const matchesSearch =
                    mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mail.body.toLowerCase().includes(searchTerm.toLowerCase())

                if (filterBy === 'all') return matchesSearch
                if (filterBy === 'starred') return mail.isStarred && matchesSearch
                if (filterBy === 'unread') return !mail.isRead && matchesSearch
                return matchesSearch
            })

            setMails(filtered)

            const unread = filtered.filter(mail => !mail.isRead)
            setUnreadCount(unread.length)

            mailService.query({ status: 'inbox' }).then(inboxMails =>
                setInboxCount(inboxMails.length)
            )
        })
    }

    function updateMail(updatedMail) {
        setMails(prevMails => {
            const updatedMails = prevMails.map(mail =>
                mail.id === updatedMail.id ? updatedMail : mail
            )
            const unread = updatedMails.filter(mail => !mail.isRead)
            setUnreadCount(unread.length)
            return updatedMails
        })

        mailService.save(updatedMail)
    }

    function removeMail(mailId) {
        mailService.get(mailId).then(mail => {
            if (mail.removedAt) {
                setMails(prev => prev.filter(mail => mail.id !== mailId))
                mailService.remove(mailId)
            } else {
                const updatedMail = { ...mail, removedAt: Date.now() }
                setMails(prev => prev.filter(mail => mail.id !== mailId))
                mailService.save(updatedMail)
            }
        })
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
                    {isSidebarOpen && <span> Compose</span>}
                </button>

                <MailFolderList
                    filterBy={filterBy}
                    onSetFilter={val => setFilterBy(val)}
                    isSidebarOpen={isSidebarOpen}
                    inboxCount={inboxCount}
                />
            </aside>

            <main className="mail-main">
                <div className="mail-controls">
                    <div className="mail-filters">
                        <button className={`filter-btn ${filterBy === 'all' ? 'active' : ''}`} onClick={() => setFilterBy('all')}>All</button>
                        {(filterBy !== 'sent' && filterBy !== 'draft') && (
                            <button
                                className={`filter-btn ${filterBy === 'unread' ? 'active' : ''}`}
                                onClick={() => setFilterBy('unread')}
                            >
                                Unread ({unreadCount})
                            </button>
                        )}
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
