import { MailPreview } from './MailPreview.jsx'

export function MailList({ mails, onUpdate }) {
    return (
        <ul className="mail-list">
            {mails.map(mail => (
                <li key={mail.id}>
                    <MailPreview mail={mail} onUpdate={onUpdate} />
                </li>
            ))}
        </ul>
    )
}
