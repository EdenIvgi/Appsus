import { MailPreview } from './MailPreview.jsx'

export function MailList({ mails, onUpdate, onRemove, onExpand, expandedMailId, onNavigateToDetails, onEditDraft }) {
    return (
        <section className="mail-list">
            {mails.map(mail => (
                <MailPreview
                    key={mail.id}
                    mail={mail}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onExpand={onExpand}
                    isExpanded={expandedMailId === mail.id}
                    onNavigateToDetails={onNavigateToDetails}
                    onEditDraft={onEditDraft} 
                />
            ))}
        </section>
    )
}
