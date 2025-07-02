import './MailPreview.css'

export function MailPreview({ mail }) {
    const sentAt = new Date(mail.sentAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })

    return (
        <div className={`mail-preview ${mail.isRead ? 'read' : 'unread'}`}>
            <span className="mail-star">☆</span>

            <div className="mail-content">
                <span className="mail-from">{mail.from}</span>
                <span className="mail-subject">{mail.subject}</span>
                <span className="mail-body"> – {mail.body}</span>
            </div>

            <div className="mail-actions">
                <span className="mail-date">{sentAt}</span>
                <button className="btn-delete">🗑️</button>
            </div>
        </div>
    )
}
