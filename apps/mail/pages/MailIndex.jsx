const { useState, useEffect } = React
const { Routes, Route, useNavigate } = ReactRouterDOM

import { GmailHeader } from '../cmps/GmailHeader.jsx'
import { mailService } from '../services/mail.service.js'
import { noteService } from '../../note/services/note.service.js'
import { eventBusService } from '../services/event-bus.service.js'
import { MailList } from '../cmps/MailList.jsx'
import { MailCompose } from '../cmps/MailCompose.jsx'
import { MailFolderList } from '../cmps/MailFolderList.jsx'
import { MailFilter } from '../cmps/MailFilter.jsx'
import { MailDetails } from './MailDetails.jsx'

export function MailIndex() {
    const [isComposing, setIsComposing] = useState(false)
    const [mailToEdit, setMailToEdit] = useState(null)
    const [mails, setMails] = useState([])
    const [filterBy, setFilterBy] = useState('inbox')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortByDate, setSortByDate] = useState('desc')
    const [expandedMailId, setExpandedMailId] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const [inboxCount, setInboxCount] = useState(0)
    const [refreshTrigger, setRefreshTrigger] = useState(Date.now())

    const navigate = useNavigate()

    useEffect(() => {
        loadMails()
    }, [filterBy, searchTerm, sortByDate, refreshTrigger])

    function loadMails() {
        mailService.query().then(allMails => {
            const userEmail = mailService.getLoggedinUser().email
            const filtered = allMails.filter(mail => {
                const matchesSearch =
                    mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    mail.body.toLowerCase().includes(searchTerm.toLowerCase())

                if (filterBy === 'inbox') return mail.to === userEmail && !mail.removedAt && !mail.isDraft && matchesSearch
                if (filterBy === 'trash') return mail.removedAt && matchesSearch
                if (filterBy === 'draft') return mail.isDraft && !mail.removedAt && matchesSearch
                if (filterBy === 'sent') return mail.from === userEmail && !mail.removedAt && !mail.isDraft && matchesSearch
                if (filterBy === 'starred') return mail.isStarred && !mail.removedAt && matchesSearch
                if (filterBy === 'unread') return !mail.isRead && !mail.removedAt && !mail.isDraft && matchesSearch
                return false
            })

            const sorted = filtered.sort((a, b) => {
                return sortByDate === 'asc' ? a.sentAt - b.sentAt : b.sentAt - a.sentAt
            })

            setMails(sorted)
            setUnreadCount(sorted.filter(mail => !mail.isRead).length)

            const inbox = allMails.filter(mail => mail.to === userEmail && !mail.removedAt && !mail.isDraft)
            setInboxCount(inbox.length)
        })
    }

    function updateMail(updatedMail) {
        setMails(prevMails => {
            const updatedMails = prevMails.map(mail =>
                mail.id === updatedMail.id ? updatedMail : mail
            )

            const userEmail = mailService.getLoggedinUser().email
            const matchesSearch =
                updatedMail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                updatedMail.body.toLowerCase().includes(searchTerm.toLowerCase())

            const shouldInclude = (() => {
                if (filterBy === 'inbox') return updatedMail.to === userEmail && !updatedMail.removedAt && !updatedMail.isDraft && matchesSearch
                if (filterBy === 'starred') return updatedMail.isStarred && !updatedMail.removedAt && matchesSearch
                if (filterBy === 'unread') return !updatedMail.isRead && !updatedMail.removedAt && !updatedMail.isDraft && matchesSearch
                if (filterBy === 'draft') return updatedMail.isDraft && !updatedMail.removedAt && matchesSearch
                if (filterBy === 'sent') return updatedMail.from === userEmail && !updatedMail.removedAt && !updatedMail.isDraft && matchesSearch
                return false
            })()

            const newMails = shouldInclude
                ? updatedMails
                : updatedMails.filter(mail => mail.id !== updatedMail.id)

            setUnreadCount(newMails.filter(mail => !mail.isRead).length)
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
        if (newMail.isDraft) return

        mailService.save(newMail).then(saved => {
            const user = mailService.getLoggedinUser().email
            const matchesFilter = () => {
                if (filterBy === 'sent') return saved.from === user
                if (filterBy === 'inbox') return saved.to === user
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

    function onEditDraft(draftMail) {
        setMailToEdit(draftMail)
        setIsComposing(true)
    }

    function toggleSidebar() {
        setIsSidebarOpen(prev => !prev)
    }

    function handleFilterChange(newFilter, term = searchTerm, sort = sortByDate) {
        setFilterBy(newFilter)
        setSearchTerm(term)
        setSortByDate(sort)
    }

    function handleSaveAsNote(mail) {
        const note = noteService.getEmptyNote('NoteTxt')
        note.info.txt = `Subject: ${mail.subject}\n\n${mail.body}`
        noteService.save(note)
            .then(() => {
                eventBusService.emit('show-user-msg', {
                    txt: 'Note saved from mail',
                    type: 'success'
                })
            })
            .catch(err => {
                console.error('Failed to save note from mail:', err)
                eventBusService.emit('show-user-msg', {
                    txt: 'Failed to save note',
                    type: 'error'
                })
            })
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
                    <MailFilter
                        filterBy={filterBy}
                        onSetFilter={handleFilterChange}
                        unreadCount={unreadCount}
                        sortByDate={sortByDate}
                    />
                </div>

                {isComposing && (
                    <MailCompose
                        mailToEdit={mailToEdit}
                        onClose={() => {
                            setIsComposing(false)
                            setMailToEdit(null)
                        }}
                        onSend={addMail}
                        onSaveDraft={() => setRefreshTrigger(Date.now())}
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
                                <MailDetails mails={mails} onUpdate={updateMail} />
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
                                onEditDraft={onEditDraft}
                                onSaveAsNote={handleSaveAsNote}
                            />
                        }
                    />
                </Routes>
            </main>
        </section>
    )
}
