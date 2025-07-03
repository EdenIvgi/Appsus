import { MailPreview } from './MailPreview.jsx'

export function MailList({ mails, onUpdate, onRemove }) {
    return (
        <ul className="mail-list">
            {mails.map(mail => (
                <li key={mail.id}>
                    <MailPreview mail={mail} onUpdate={onUpdate} onRemove={onRemove} />
                </li>
            ))}
        </ul>
    )
}
