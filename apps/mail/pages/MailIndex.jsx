// MailIndex.jsx
const { useState, useEffect } = React
const { Routes, Route, useParams, useNavigate } = ReactRouterDOM

import { GmailHeader } from '../cmps/GmailHeader.jsx'
import { mailService } from '../services/mail.service.js'
import { MailList } from '../cmps/MailList.jsx'
import { MailCompose } from '../cmps/MailCompose.jsx'
import { MailFolderList } from '../cmps/MailFolderList.jsx'
import { MailFilter } from '../cmps/MailFilter.jsx'
import { MailDetails } from './MailDetails.jsx'

export function MailIndex() {
    const [isComposing, setIsComposing] = useState(false)
    const [mails, setMails] = useState([])
    const [filterBy, setFilterBy] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortByDate, setSortByDate] = useState('desc') // New sort state
    const [expandedMailId, setExpandedMailId] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const [inboxCount, setInboxCount] = useState(0)

    const { mailId } = useParams()
    const navigate = useNavigate()

    const isInbox = filterBy === 'inbox' || filterBy === 'all'

    useEffect(() => {
        loadMails()
    }, [filterBy, searchTerm, sortByDate])

    useEffect(() => {
        if (!isInbox && mailId) navigate('/mail')
    }, [filterBy])

    function loadMails() {
        const status = filterBy === 'all' || filterBy === 'unread' ? 'inbox' : filterBy

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

            const sorted = filtered.sort((a, b) => {
                return sortByDate === 'asc' ? a.sentAt - b.sentAt : b.sentAt - a.sentAt
            })

            setMails(sorted)
            setUnreadCount(sorted.filter(mail => !mail.isRead).length)

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

            const matchesSearch =
                updatedMail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                updatedMail.body.toLowerCase().includes(searchTerm.toLowerCase())

            const shouldInclude = (() => {
                if (filterBy === 'all') return matchesSearch
                if (filterBy === 'starred') return updatedMail.isStarred && matchesSearch
                if (filterBy === 'unread') return !updatedMail.isRead && matchesSearch
                return matchesSearch
            })()

            const newMails = shouldInclude
                ? updatedMails
                : updatedMails.filter(mail => mail.id !== updatedMail.id)

            const newUnreadCount = newMails.filter(mail => !mail.isRead).length
            setUnreadCount(newUnreadCount)
            return newMails
        })

        mailService.save(updatedMail)
    }

    function removeMail(mailId) {
        mailService.get(mailId).then(mail => {
            if (mail.removedAt) {
                setMails(prev => prev.filter(m => m.id !== mailId))
                mailService.remove(mailId)
            } else {
                const updated = { ...mail, removedAt: Date.now() }
                setMails(prev => prev.filter(m => m.id !== mailId))
                mailService.save(updated)
            }
        })
    }

    function addMail(newMail) {
        mailService.save(newMail).then(saved => {
            const matchesFilter = () => {
                const user = mailService.getLoggedinUser().email
                if (filterBy === 'sent') return saved.from === user
                if (filterBy === 'inbox' || filterBy === 'all') return saved.to === user
                return false
            }
            if (matchesFilter()) setMails(prev => [saved, ...prev])
        })
    }

    function onExpand(mail) {
        setExpandedMailId(prevId => (prevId === mail.id ? null : mail.id))
    }

    function onNavigateToDetails(mailId) {
        navigate(`/mail/${mailId}`)
    }

    function toggleSidebar() {
        setIsSidebarOpen(prev => !prev)
    }

    function handleFilterChange(newFilter, term = searchTerm, sort = sortByDate) {
        setFilterBy(newFilter)
        setSearchTerm(term)
        setSortByDate(sort)
    }

    const selectedMail = mails.find(mail => mail.id === mailId)

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
                    <MailFilter
                        filterBy={filterBy}
                        onSetFilter={handleFilterChange}
                        unreadCount={unreadCount}
                        sortByDate={sortByDate}
                    />
                </div>

                {isComposing && (
                    <MailCompose
                        onClose={() => setIsComposing(false)}
                        onSend={addMail}
                    />
                )}

                <Routes>
                    <Route
                        path=":mailId"
                        element={
                            <div>
                                <button className="btn-back" onClick={() => navigate('/mail')}>
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                {selectedMail
                                    ? <MailDetails mail={selectedMail} onUpdate={updateMail} />
                                    : <div className="mail-details loading">Loading mail...</div>}
                            </div>
                        }
                    />
                    <Route
                        index
                        element={
                            <MailList
                                mails={mails}
                                onUpdate={updateMail}
                                onRemove={removeMail}
                                onExpand={onExpand}
                                expandedMailId={expandedMailId}
                                onNavigateToDetails={onNavigateToDetails}
                            />
                        }
                    />
                </Routes>
            </main>
        </section>
    )
}