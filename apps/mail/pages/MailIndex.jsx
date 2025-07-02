const { useState, useEffect } = React
import { mailService } from '../services/mail.service.js'
import { MailList } from '../cmps/MailList.jsx'

export function MailIndex() {
    const [mails, setMails] = useState(null)

    useEffect(() => {
        loadMails()
    }, [])

    function loadMails() {
        mailService.query()
            .then(mails => {
                console.log('Loaded mails:', mails)
                setMails(mails)
            })
            .catch(err => {
                console.error('Failed to load mails:', err)
            })
    }

    if (!mails) return <section className="mail-index">Loading mails...</section>

    return (
        <section className="mail-index">
            <h2>Inbox</h2>
            <MailList mails={mails} />
        </section>
    )
}
