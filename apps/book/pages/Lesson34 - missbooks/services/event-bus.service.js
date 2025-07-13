import { getRandomIntInclusive } from "./util.service.js"


export const USER_MSG ='show-user-msg'
function createEventEmitter() {
    const listenersMap = {}
    return {
        //* Use this function to subscribe to an event
        on(evName, listener) {
            listenersMap[evName] = listenersMap[evName] ? [...listenersMap[evName], listener] : [listener]
            return () => {
                listenersMap[evName] = listenersMap[evName].filter(func => func !== listener)
            }
        },

        //* Use this function to emit an event
        emit(evName, data) {
            if (!listenersMap[evName]) return
            listenersMap[evName].forEach(listener => listener(data))
        }
    }
}

export const eventBusService = createEventEmitter()
window.evBus = eventBusService

////////////////////////////////////////////////////

function _showUserMsg(msg) {
    eventBusService.emit(USER_MSG, msg)
}

export function showSuccessMsg(txt) {
    _showUserMsg({ txt, type: 'success' })
}

export function showErrorMsg(txt) {
    _showUserMsg({ txt, type: 'error' })
}

window.showSuccessMsg = showSuccessMsg
window.showErrorMsg = showErrorMsg



// Service Testing:
// Example for using the service

const unsubscribe1 = eventBusService.on('some-event', (data) => {
    console.log('Listener #1 got:', data)
})


// eventBusService.on('some-event', (data) => {
//     console.log('Listener #2 got:', data)
// })


// setInterval(() => {
//     eventBusService.emit('some-event', getRandomIntInclusive(1, 100))
//     console.log('');
// }, 1000);


// setTimeout(() => {
//     unsubscribe1()
// }, 3000);


// eventBusService.on('my-click', (ev) => {
//     console.log('ev:', ev)
// })