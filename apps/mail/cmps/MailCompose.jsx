const { useState } = React

export function MailCompose({ onClose, onSend }) {
    const [mail, setMail] = useState({
        to: '',
        subject: '',
        body: '',
    })

    function handleChange({ target }) {
        const { name, value } = target
        setMail(prev => ({ ...prev, [name]: value }))
    }

    function onFormSubmit(ev) {
        ev.preventDefault()
        if (!mail.to || !mail.subject) return
        onSend(mail)
        onClose()
    }

    return (
        <section className="mail-compose">
            <header className="compose-header">
                <span>New Message</span>
                <button onClick={onClose} className="btn-close">
                    <span className="material-icons">close</span>
                </button>
            </header>

            <form onSubmit={onFormSubmit} className="compose-form">
                <input
                    type="email"
                    name="to"
                    placeholder="To"
                    value={mail.to}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={mail.subject}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="body"
                    placeholder="Body"
                    value={mail.body}
                    onChange={handleChange}
                ></textarea>

                <footer className="compose-actions">
                    <button type="submit" className="btn-send">
                        Send
                    </button>
                </footer>
            </form>
        </section>
    )
}
