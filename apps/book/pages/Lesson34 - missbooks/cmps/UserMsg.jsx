import { eventBusService ,USER_MSG} from "../services/event-bus.service.js"

const { useState, useEffect } = React

// const demoMsg = { type: 'success', txt: 'Oh how great of you to join us!' }

export function UserMsg() {

    const [msg, setMsg] = useState(null)

    useEffect(() => {
        const unsubscribe = eventBusService.on(USER_MSG, (msg) => {
            setMsg(msg)
            setTimeout(() => {
                closeMsg()
            }, 3000)
        })

        return () => unsubscribe()
    }, [])

    function closeMsg() {
        setMsg(null)
    }

    if (!msg) return null
    return (
        <section className={`user-msg ${msg.type}`}>
            <h4>{msg.txt}</h4>
            <button onClick={closeMsg} className="close-btn">X</button>
        </section>
    )
}