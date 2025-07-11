const { useEffect, useRef, useState } = React
import { mailService } from '../services/mail.service.js'

export function MailCompose({ onClose, onSend, onSaveDraft, mailToEdit }) {
    const [mail, setMail] = useState(() => mailToEdit || mailService.getEmptyMail())
    const lastSavedMailRef = useRef(mail)

    useEffect(() => {
        setMail(mailToEdit || mailService.getEmptyMail())
    }, [mailToEdit])

    useEffect(() => {
        const intervalId = setInterval(() => {
            const hasChanged = JSON.stringify(mail) !== JSON.stringify(lastSavedMailRef.current)
            if (hasChanged) {
                const toSave = {
                    ...mail,
                    isDraft: true,
                    sentAt: null,
                }
                mailService.save(toSave).then(savedMail => {
                    setMail(savedMail)
                    lastSavedMailRef.current = savedMail
                    if (typeof onSaveDraft === 'function') onSaveDraft()
                })
            }
        }, 5000)

        return () => clearInterval(intervalId)
    }, [mail])

    function handleChange({ target }) {
        const { name, value } = target
        setMail(prev => ({ ...prev, [name]: value }))
    }

    function onFormSubmit(ev) {
        ev.preventDefault()
        if (!mail.to || !mail.subject) return

        if (mail.id) mailService.remove(mail.id)

        const sentMail = {
            ...mail,
            id: null,
            isDraft: false,
            sentAt: Date.now(),
        }

        if (typeof onSend === 'function') onSend(sentMail)
        onClose()
    }

    return (
        <section className="mail-compose">
            <header className="compose-header">
                <span>New Message</span>
                <button onClick={onClose} className="btn-close">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </header>

            <form onSubmit={onFormSubmit} className="compose-form">
                <input
                    type="email"
                    name="to"
                    placeholder="To"
                    value={mail.to}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={mail.subject}
                    onChange={handleChange}
                />
                <textarea
                    name="body"
                    placeholder=""
                    value={mail.body}
                    onChange={handleChange}
                ></textarea>

                <footer className="compose-actions">
                    <button type="submit" className="btn-send">Send</button>
                </footer>
            </form>
        </section>
    )
}