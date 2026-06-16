import { useState } from "react";
import { useSiteContent } from "../data";

export default function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);
	const { brandName, nav, whatsappNumber } = useSiteContent();
	const links = nav.links;
	const waHref = `https://wa.me/${whatsappNumber}`;

	return (
		<header className="sticky top-0 z-50 border-b backdrop-blur-md bg-cream/85 border-ink/8">
			<div className="flex items-center justify-between h-18 max-w-6xl px-5 mx-auto">
				<a
					href="#top"
					className="text-4xl leading-none font-display text-sky-ink"
				>
					{brandName}
				</a>

				{/* Desktop links */}
				<nav className="items-center hidden gap-1 md:flex">
					{links.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="px-4 py-2 text-sm font-semibold transition-colors rounded-full font-head text-ink hover:bg-sky hover:text-sky-ink"
						>
							{link.label}
						</a>
					))}
				</nav>

				{/* Desktop WhatsApp pill */}
				<a
					href={waHref}
					className="items-center hidden gap-2 px-5 py-3 text-sm font-bold text-white transition-shadow rounded-full md:inline-flex font-head bg-mint-deep hover:shadow-lg hover:shadow-mint-deep/40 btn-press"
				>
					<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
						<path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-1-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
						<path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.5 5.8L0 24l6.3-1.5c1.7.9 3.6 1.4 5.6 1.4 6.6 0 12-5.4 12-12S18.6 0 12 0zm0 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.8 1 1-3.6-.2-.4A9.8 9.8 0 012.2 12 9.8 9.8 0 0112 2.2 9.8 9.8 0 0121.8 12 9.8 9.8 0 0112 21.8z" />
					</svg>
					WhatsApp
				</a>

				{/* Mobile hamburger */}
				<button
					type="button"
					className="grid w-12 h-12 cursor-pointer md:hidden place-items-center bg-sky text-sky-ink rounded-2xl btn-press"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Menú"
					aria-expanded={menuOpen}
				>
					<svg
						className="w-6 h-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2.4}
						strokeLinecap="round"
					>
						{menuOpen ? (
							<path d="M6 18L18 6M6 6l12 12" />
						) : (
							<path d="M4 6h16M4 12h16M4 18h16" />
						)}
					</svg>
				</button>
			</div>

			{/* Mobile menu */}
			{menuOpen && (
				<nav className="flex flex-col px-5 pb-4 md:hidden bg-cream animate-slide-down">
					{links.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="py-3 font-semibold border-b border-dotted font-head border-line"
							onClick={() => setMenuOpen(false)}
						>
							{link.label}
						</a>
					))}
					<a
						href={waHref}
						className="py-3 font-bold font-head text-mint-deep"
						onClick={() => setMenuOpen(false)}
					>
						Pedir por WhatsApp →
					</a>
				</nav>
			)}
		</header>
	);
}
