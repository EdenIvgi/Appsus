const { useState } = React

export function MailCompose({ onClose }) {
    const [mail, setMail] = useState({
        to: '',
        subject: '',
        body: '',
    })

    function handleChange({ target }) {
        const { name, value } = target
        setMail(prev => ({ ...prev, [name]: value }))
    }

    function onSend(ev) {
        ev.preventDefault()
        console.log('Sending mail:', mail)
        onClose()
    }

    return (
        <section className="mail-compose">
            <div className="compose-header">
                <span>New Message</span>
                <button className="btn-close" onClick={onClose}>
                    <span className="material-icons">close</span>
                </button>
            </div>

            <form onSubmit={onSend}>
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
                />
                <textarea
                    name="body"
                    placeholder="Message..."
                    value={mail.body}
                    onChange={handleChange}
                ></textarea>

                <div className="compose-actions">
                    <button type="submit" className="btn-send">Send</button>
                </div>
            </form>
        </section>
    )
}
