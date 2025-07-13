import { AppHeader } from './Lesson34 - missbooks/cmps/AppHeader.jsx'
import { AboutUs } from './Lesson34 - missbooks/pages/AboutUs.jsx'
import { HomePage } from './Lesson34 - missbooks/pages/HomePage.jsx'
import { BookIndex as BookList } from './Lesson34 - missbooks/pages/BookIndex.jsx'
import { BookDetails } from './Lesson34 - missbooks/cmps/BookDetails.jsx'
import { BookEdit } from './Lesson34 - missbooks/cmps/BookEdit.jsx'
import { UserMsg } from './Lesson34 - missbooks/cmps/UserMsg.jsx'
import { BookAdd } from './Lesson34 - missbooks/cmps/BookAdd.jsx'

const { Routes, Route } = ReactRouterDOM

export function BookIndex() {
    return (
        <section className="app">
            <AppHeader />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/list" element={<BookList />} />
                    <Route path="/:bookId" element={<BookDetails />} />
                    <Route path="/edit" element={<BookEdit />} />
                    <Route path="/edit/:bookId" element={<BookEdit />} />
                    <Route path="/add/google" element={<BookAdd />} />
                </Routes>
            </main>
            <UserMsg />
        </section>
    )
} 