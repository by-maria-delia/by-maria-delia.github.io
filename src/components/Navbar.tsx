import { useState } from "react";
import { useSiteContent } from "../data";

export default function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);
	const { brandName, nav } = useSiteContent();
	const links = nav.links;

	return (
		<nav className="sticky top-0 z-50 border-b bg-soft-white/85 backdrop-blur-md border-denim-blue/10">
			<div className="flex items-center justify-between h-16 max-w-6xl px-5 mx-auto">
				<a
					href="/"
					className="text-2xl tracking-tight transition-colors font-display text-denim-blue hover:text-teacher-pink"
				>
					{brandName}
				</a>

				{/* Desktop links */}
				<ul className="hidden gap-10 md:flex">
					{links.map((link) => (
						<li key={link.href}>
							<a
								href={link.href}
								className="relative text-sm font-semibold tracking-wide uppercase text-denim-blue hover:text-dark-text transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-teacher-pink after:transition-all hover:after:w-full"
							>
								{link.label}
							</a>
						</li>
					))}
				</ul>

				{/* Mobile hamburger */}
				<button
					type="button"
					className="p-2 -mr-2 transition-colors rounded-lg md:hidden text-denim-blue hover:bg-school-blue/10"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Menú"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						{menuOpen ? (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						) : (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						)}
					</svg>
				</button>
			</div>

			{/* Mobile menu */}
			{menuOpen && (
				<ul className="px-5 pb-5 border-t md:hidden bg-soft-white/95 backdrop-blur-md border-denim-blue/10 animate-slide-down">
					{links.map((link) => (
						<li key={link.href}>
							<a
								href={link.href}
								className="block py-3 text-sm font-semibold transition-colors text-denim-blue hover:text-teacher-pink"
								onClick={() => setMenuOpen(false)}
							>
								{link.label}
							</a>
						</li>
					))}
				</ul>
			)}
		</nav>
	);
}
