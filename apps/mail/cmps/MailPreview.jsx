export function MailPreview({ mail, onUpdate, onRemove }) {
    const sentAt = new Date(mail.sentAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })

    function onMarkAsRead() {
        if (mail.isRead) return
        const updatedMail = { ...mail, isRead: true }
        onUpdate(updatedMail)
    }

    function onDelete(ev) {
        ev.stopPropagation()
        onRemove(mail.id)
    }

    function onToggleRead(ev) {
        ev.stopPropagation()
        const updatedMail = { ...mail, isRead: !mail.isRead }
        onUpdate(updatedMail)
    }

    function onToggleStar(ev) {
        ev.stopPropagation()
        const updatedMail = { ...mail, isStarred: !mail.isStarred }
        onUpdate(updatedMail)
    }

    function onExpand(ev) {
        ev.stopPropagation()
        console.log('Expand mail', mail.id)
    }

    return (
        <div className={`mail-preview ${mail.isRead ? 'read' : 'unread'}`} onClick={onMarkAsRead}>
            <span className={`mail-star ${mail.isStarred ? 'starred' : ''}`} onClick={onToggleStar}>★</span>

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
