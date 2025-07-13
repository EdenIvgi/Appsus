const { NavLink, Link } = ReactRouterDOM;

export function AppHeader() {
	return (
		<header className="app-header">
			<div className="header-left">
				<Link to="/" className="appsus-logo-btn">
					<span className="material-symbols-outlined">orbit</span>
				</Link>
				<h1>Miss Books</h1>
			</div>
			<nav>
				<NavLink to="/book">Home</NavLink>
				<NavLink to="/book/about">About</NavLink>
				<NavLink to="/book/list">Books</NavLink>
			</nav>
		</header>
	);
} 