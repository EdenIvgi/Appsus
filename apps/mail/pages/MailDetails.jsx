const { useParams } = ReactRouterDOM
const { useEffect } = React

export function MailDetails({ mails, onUpdate }) {
    const { mailId } = useParams()
    const mail = mails.find(mail => mail.id === mailId || mail.id === +mailId)

    useEffect(() => {
        if (mail && !mail.isRead && !mail.isDraft) {
            const updated = { ...mail, isRead: true }
            onUpdate(updated)
        }
    }, [mail])

    if (!mail) return <div className="mail-details loading">Loading mail...</div>

    return (
        <div className="mail-details">
            <header className="mail-details-header">
                <h2 className="mail-subject">{mail.subject}</h2>
                {mail.isDraft && <span className="draft-label">[DRAFT]</span>}
            </header>

            <section className="mail-meta">
                <p><strong>From:</strong> {mail.from}</p>
                <p><strong>To:</strong> {mail.to}</p>
            </section>

            <section className="mail-body">
                <p>{mail.body}</p>
            </section>
        </div>
    )
}
