export function MailPreview({ mail, onUpdate, onRemove, onExpand, isExpanded, onNavigateToDetails }) {
    const sentAt = new Date(mail.sentAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })

    function getMailSnippet(body) {
        if (body.length <= 60) return body
        const lastSpace = body.lastIndexOf(' ', 60)
        return body.slice(0, lastSpace > 0 ? lastSpace : 60) + '...'
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

    function onExpandClick(ev) {
        ev.stopPropagation()
        onExpand(mail)
    }

    function onBodyClick(ev) {
        ev.stopPropagation()
        onNavigateToDetails(mail.id)
    }

    return (
        <div
            className={`mail-preview ${mail.isRead ? 'read' : 'unread'} ${isExpanded ? 'expanded' : ''}`}
        >
            <span
                className={`mail-star ${mail.isStarred ? 'starred' : ''}`}
                onClick={onToggleStar}
                title="Star"
            >
                ★
            </span>

            <div className="mail-content" onClick={onBodyClick}>
                <span className="mail-from">{mail.from}</span>
                <span className="mail-subject">{mail.subject}</span>
                {!isExpanded && (
                    <span className="mail-body">{getMailSnippet(mail.body)}</span>
                )}
            </div>

            <div className="mail-date">{sentAt}</div>

            <div className="mail-actions">
                <button className="btn-mail-action" onClick={onExpandClick} title="Expand">
                    <span className="material-symbols-outlined">crop_free</span>
                </button>
                <button className="btn-mail-action" onClick={onDelete} title="Delete">
                    <span className="material-symbols-outlined">delete</span>
                </button>
                <button className="btn-mail-action" onClick={onToggleRead} title="Toggle Read">
                    <span className="material-symbols-outlined">
                        {mail.isRead ? 'mark_email_unread' : 'mark_email_read'}
                    </span>
                </button>
            </div>

            {isExpanded && (
                <div className="mail-expanded-body">
                    <p>{mail.body}</p>
                </div>
            )}
        </div>
    )
}
