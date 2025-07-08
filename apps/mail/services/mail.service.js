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
    getDefaultFilter,
    getFilterFromSearchParams,
    createMail,
    getLoggedinUser
}

function query(filterBy = {}) {
    return storageService.query(MAIL_KEY)
        .then(mails => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                mails = mails.filter(mail =>
                    regExp.test(mail.subject) || regExp.test(mail.body)
                )
            }

            if (filterBy.status) {
                if (filterBy.status === 'inbox') {
                    mails = mails.filter(mail =>
                        mail.to === loggedinUser.email &&
                        !mail.removedAt &&
                        !mail.isDraft
                    )
                } else if (filterBy.status === 'sent') {
                    mails = mails.filter(mail =>
                        mail.from === loggedinUser.email &&
                        !mail.removedAt
                    )
                } else if (filterBy.status === 'trash') {
                    mails = mails.filter(mail => mail.removedAt)
                } else if (filterBy.status === 'draft') {
                    mails = mails.filter(mail =>
                        mail.isDraft && !mail.removedAt
                    )
                }
            }

            if (filterBy.isRead !== undefined) {
                mails = mails.filter(mail =>
                    mail.isRead === filterBy.isRead &&
                    !mail.removedAt
                )
            }

            if (filterBy.isStarred) {
                mails = mails.filter(mail =>
                    mail.isStarred && !mail.removedAt
                )
            }

            return mails
        })
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

function getDefaultFilter() {
    return { txt: '', status: 'inbox' }
}

function getFilterFromSearchParams(searchParams) {
    const txt = searchParams.get('txt') || ''
    const status = searchParams.get('status') || 'inbox'
    return { txt, status }
}

function getLoggedinUser() {
    return loggedinUser
}

function createMail({ to, subject, body }) {
    return {
        id: utilService.makeId(),
        from: loggedinUser.email,
        to,
        subject,
        body,
        sentAt: Date.now(),
        isRead: false,
        isStarred: false,
        removedAt: null,
        isDraft: false
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
