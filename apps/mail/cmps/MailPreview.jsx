import { mailService } from '../services/mail.service.js'

export function MailPreview({ mail, onUpdate }) {
    const sentAt = new Date(mail.sentAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })

    function onMarkAsRead() {
        if (mail.isRead) return
        const updatedMail = { ...mail, isRead: true }
        mailService.save(updatedMail).then(() => {
            onUpdate()
        })
    }

    function onDelete(ev) {
        ev.stopPropagation()
        mailService.remove(mail.id).then(() => {
            onUpdate()
        })
    }

    function onToggleRead(ev) {
        ev.stopPropagation()
        const updatedMail = { ...mail, isRead: !mail.isRead }
        mailService.save(updatedMail).then(() => {
            onUpdate()
        })
    }

    function onExpand(ev) {
        ev.stopPropagation()
        // Logic for expanding mail preview (navigate or open modal)
        console.log('Expand mail', mail.id)
    }

    return (
        <div className={`mail-preview ${mail.isRead ? 'read' : 'unread'}`} onClick={onMarkAsRead}>
            <span className="mail-star">☆</span>

            <div className="mail-content">
                <span className="mail-from">{mail.from}</span>
                <span className="mail-subject">{mail.subject}</span>
                <span className="mail-body"> {mail.body}</span>
            </div>

            <div className="mail-date">{sentAt}</div>

            <div className="mail-actions">
                <button className="btn-mail-action" onClick={onExpand}>
                    <span className="material-icons">open_in_full</span>
                </button>
                <button className="btn-mail-action" onClick={onDelete}>
                    <span className="material-icons">delete</span>
                </button>
                <button className="btn-mail-action" onClick={onToggleRead}>
                    <span className="material-icons">
                        {mail.isRead ? 'mark_email_unread' : 'mark_email_read'}
                    </span>
                </button>
            </div>
        </div>
    )
}

