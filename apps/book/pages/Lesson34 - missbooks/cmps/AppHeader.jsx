const { NavLink } = ReactRouterDOM;

export function AppHeader() {
	return (
		<header className="app-header">
			<h1>Miss Books</h1>
			<nav>
				<NavLink to="/book">Home</NavLink>
				<NavLink to="/book/about">About</NavLink>
				<NavLink to="/book/list">Books</NavLink>
			</nav>
		</header>
	);
} 