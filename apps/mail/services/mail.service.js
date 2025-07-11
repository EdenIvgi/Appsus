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
