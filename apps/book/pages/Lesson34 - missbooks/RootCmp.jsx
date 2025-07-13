const { useState } = React

import { AppHeader } from './cmps/AppHeader.jsx';
import { AboutUs } from './pages/AboutUs.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { BookIndex } from './pages/BookIndex.jsx';
import { BookDetails } from './cmps/BookDetails.jsx';
import { BookEdit } from './cmps/BookEdit.jsx';
import { UserMsg } from './cmps/UserMsg.jsx';
import { BookAdd } from './cmps/BookAdd.jsx';

const Router = ReactRouterDOM.HashRouter
const { Routes, Route } = ReactRouterDOM

export function RootCmp() {
	return (
		<Router>
			<section className="app">
				<AppHeader />
				<main>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/about" element={<AboutUs />} />
						<Route path="/book" element={<BookIndex />} />
						<Route path="/book/:bookId" element={<BookDetails />} />
						<Route path="/book/edit" element={<BookEdit />} />
						<Route path="/book/edit/:bookId" element={<BookEdit />} />
						<Route path="/book/add/google" element={<BookAdd />} />
					</Routes>
				</main>
			</section>
			<UserMsg />
		</Router>
	);
} 