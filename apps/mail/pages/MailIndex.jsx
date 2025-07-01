const { useState, useEffect } = React

import { mailService } from '../services/mail.service.js'

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
            <p>Loaded {mails.length} mails</p>
        </section>
    )
}
