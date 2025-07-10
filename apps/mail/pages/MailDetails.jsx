const { useParams, useNavigate } = ReactRouterDOM
const { useEffect, useState } = React

import { mailService } from '../services/mail.service.js'

export function MailDetails({ mail: mailFromProps, onUpdate }) {
    const { mailId } = useParams()
    const navigate = useNavigate()
    const [mail, setMail] = useState(mailFromProps || null)

    useEffect(() => {
        // אם אין מייל – נטען אותו מהשירות
        if (!mailFromProps && mailId) {
            mailService.get(mailId)
                .then(setMail)
                .catch(err => {
                    console.log('Failed to load mail:', err)
                    setMail(null)
                })
        }
    }, [mailFromProps, mailId])

    useEffect(() => {
        if (mail && !mail.isRead) {
            const updated = { ...mail, isRead: true }
            onUpdate(updated)
        }
    }, [mail])

    if (!mail) return <div className="mail-details loading">Loading mail...</div>

    return (
        <div className="mail-details">
            <header className="mail-details-header">
                <h2 className="mail-subject">{mail.subject}</h2>
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


