const { Route, Routes, useLocation } = ReactRouterDOM
const Router = ReactRouterDOM.HashRouter

import { AppHeader } from './cmps/AppHeader.jsx'
import { UserMsg } from './cmps/UserMsg.jsx'
import { About } from './pages/About.jsx'
import { Home } from './pages/Home.jsx'
import { MailIndex } from './apps/mail/pages/MailIndex.jsx'
import { NoteIndex } from './apps/note/pages/NoteIndex.jsx'


function AppRoutes() {
    const location = useLocation()
    const isMailRoute = location.pathname.startsWith('/mail')

    return (
        <section className="root-cmp">
            {!isMailRoute && <AppHeader />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/mail/*" element={<MailIndex />} />
                <Route path="/note" element={<NoteIndex />} />

            </Routes>
            <UserMsg />
        </section>
    )
}

export function RootCmp() {
    return (
        <Router>
            <AppRoutes />
        </Router>
    )
}

