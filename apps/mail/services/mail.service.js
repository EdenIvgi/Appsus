import { utilService } from '../../../services/util.service.js'
import { storageService } from '../../../services/async-storage.service.js'

const MAIL_KEY = 'mailDB'
const loggedinUser = {
    email: 'user@appsus.com',
    fullname: 'Mahatma Appsus'
}

_createMails()

export const mailService = {
    query,
    get,
    remove,
    save,
    getEmptyMail,
    getLoggedinUser,
    createMail
}

function query() {
    return storageService.query(MAIL_KEY)
}

function get(mailId) {
    return storageService.get(MAIL_KEY, mailId).then(_setNextPrevMailId)
}

function remove(mailId) {
    return storageService.remove(MAIL_KEY, mailId)
}

function save(mail) {
    if (!mail.id) {
        mail = createMail(mail)
        return storageService.post(MAIL_KEY, mail)
    } else {
        return storageService.put(MAIL_KEY, mail)
    }
}

function getEmptyMail() {
    return {
        subject: '',
        body: '',
        isRead: false,
        sentAt: null,
        removedAt: null,
        from: loggedinUser.email,
        to: '',
        isStarred: false,
        isDraft: false
    }
}

function getLoggedinUser() {
    return loggedinUser
}

function createMail({ to, subject, body, isDraft = false }) {
    return {
        id: utilService.makeId(),
        from: loggedinUser.email,
        to,
        subject,
        body,
        sentAt: isDraft ? null : Date.now(),
        isRead: false,
        isStarred: false,
        removedAt: null,
        isDraft
    }
}

function _createMails() {
    const mails = utilService.loadFromStorage(MAIL_KEY)
    if (mails && mails.length) return

    const demoMails = [
        {
            id: utilService.makeId(),
            subject: 'Project update',
            body: 'The team meeting is postponed to next week.',
            isRead: false,
            sentAt: Date.now() - 10000000,
            removedAt: null,
            from: 'team@company.com',
            to: loggedinUser.email,
            isStarred: false,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'Invitation to event',
            body: 'Join us for the launch of our new product.',
            isRead: true,
            sentAt: Date.now() - 5000000,
            removedAt: null,
            from: 'events@service.com',
            to: loggedinUser.email,
            isStarred: true,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'event',
            body: 'Join us for the launch of our new product.',
            isRead: true,
            sentAt: Date.now() - 5000000,
            removedAt: null,
            from: 'events@service.com',
            to: loggedinUser.email,
            isStarred: true,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'Reminder: Design Review Tomorrow',
            body: 'Don’t forget our design review at 10:00 AM tomorrow.',
            isRead: false,
            sentAt: Date.now() - 20000000,
            removedAt: null,
            from: 'design@company.com',
            to: loggedinUser.email,
            isStarred: true,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'Invoice for Services',
            body: 'Please find attached the invoice for last month’s services.',
            isRead: true,
            sentAt: Date.now() - 50000000,
            removedAt: null,
            from: 'billing@freelance.io',
            to: loggedinUser.email,
            isStarred: false,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'Vacation Request Approved',
            body: 'Your vacation request from July 20 to July 25 has been approved.',
            isRead: true,
            sentAt: Date.now() - 3000000,
            removedAt: null,
            from: 'hr@company.com',
            to: loggedinUser.email,
            isStarred: false,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'Security Alert',
            body: 'New login detected from a new device. If this wasn’t you, please reset your password.',
            isRead: false,
            sentAt: Date.now() - 7200000,
            removedAt: null,
            from: 'security@safeapp.com',
            to: loggedinUser.email,
            isStarred: true,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'Weekly Newsletter',
            body: 'Check out the latest trends in the industry this week!',
            isRead: false,
            sentAt: Date.now() - 86000000,
            removedAt: null,
            from: 'news@updates.com',
            to: loggedinUser.email,
            isStarred: false,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'Your Order Has Shipped!',
            body: 'Your order #45827 has been shipped and is on its way.',
            isRead: true,
            sentAt: Date.now() - 9600000,
            removedAt: null,
            from: 'orders@shop.com',
            to: loggedinUser.email,
            isStarred: true,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'RSVP: Company Retreat',
            body: 'Please RSVP for the upcoming company retreat in the mountains.',
            isRead: false,
            sentAt: Date.now() - 37000000,
            removedAt: null,
            from: 'events@company.com',
            to: loggedinUser.email,
            isStarred: false,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'Welcome to the Platform',
            body: 'Thanks for signing up! Let’s get you started.',
            isRead: true,
            sentAt: Date.now() - 16000000,
            removedAt: null,
            from: 'support@platform.io',
            to: loggedinUser.email,
            isStarred: false,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'Action Required: Confirm Email',
            body: 'Please confirm your email address to continue using our service.',
            isRead: false,
            sentAt: Date.now() - 42000000,
            removedAt: null,
            from: 'noreply@webapp.com',
            to: loggedinUser.email,
            isStarred: false,
            isDraft: false
        },
        {
            id: utilService.makeId(),
            subject: 'Your Subscription is Ending Soon',
            body: 'Renew now to continue enjoying premium benefits.',
            isRead: true,
            sentAt: Date.now() - 58000000,
            removedAt: null,
            from: 'subscriptions@mediahub.com',
            to: loggedinUser.email,
            isStarred: true,
            isDraft: false
        }

    ]

    utilService.saveToStorage(MAIL_KEY, demoMails)
}

function _setNextPrevMailId(mail) {
    return query().then(mails => {
        const mailIdx = mails.findIndex(currMail => currMail.id === mail.id)
        const nextMail = mails[mailIdx + 1] || mails[0]
        const prevMail = mails[mailIdx - 1] || mails[mails.length - 1]
        mail.nextMailId = nextMail.id
        mail.prevMailId = prevMail.id
        return mail
    })
}
