import { useSiteContent } from "../data";
import { track } from "../utils/analytics";

export default function Footer() {
	const {
		brandName,
		tagline,
		whatsappNumber,
		instagramUrl,
		instagramHandle,
		footer,
	} = useSiteContent();

	const linkClass =
		"inline-flex items-center gap-2.5 font-bold font-head text-white/85 transition-colors hover:text-butter";

	return (
		<footer id="contacto" className="text-white bg-sky-ink">
			<div className="flex flex-col gap-8 px-5 py-14 mx-auto max-w-6xl md:flex-row md:items-start md:justify-between">
				<div>
					<div className="text-3xl font-display">María Delia</div>
					<p className="max-w-[34ch] mt-2 font-semibold text-sky/85">
						{tagline}
					</p>
				</div>

				<div className="flex flex-col gap-3.5">
					<a
						href={`https://wa.me/${whatsappNumber}`}
						target="_blank"
						rel="noopener noreferrer"
						onClick={() =>
							track("social_click", {
								platform: "whatsapp",
								location: "footer",
							})
						}
						className={linkClass}
					>
						<svg
							className="w-4.5 h-4.5 shrink-0"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-1-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
							<path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.5 5.8L0 24l6.3-1.5c1.7.9 3.6 1.4 5.6 1.4 6.6 0 12-5.4 12-12S18.6 0 12 0z" />
						</svg>
						{footer.whatsappLabel}
					</a>

					<a
						href={instagramUrl}
						target="_blank"
						rel="noopener noreferrer"
						onClick={() =>
							track("social_click", {
								platform: "instagram",
								location: "footer",
							})
						}
						className={linkClass}
					>
						<svg
							className="w-4.5 h-4.5 shrink-0"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.23 1.66-4.77 4.92-4.92C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
						</svg>
						{instagramHandle}
					</a>

					<span className="inline-flex items-center gap-2.5 font-bold font-head text-white/65">
						<svg
							className="w-4.5 h-4.5 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={1.6}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19.5 10.5c0 7.14-7.5 11.25-7.5 11.25S4.5 17.64 4.5 10.5a7.5 7.5 0 1115 0z"
							/>
						</svg>
						{footer.location}
					</span>
				</div>
			</div>

			<div className="max-w-6xl px-5 mx-auto">
				<div className="flex flex-col gap-1.5 py-4 text-[.82rem] font-semibold border-t text-white/60 border-white/15 sm:flex-row sm:items-center sm:justify-between">
					<span>
						&copy; {new Date().getFullYear()} {brandName}. {footer.copyright}
					</span>
					<span>
						Hecho por{" "}
						<a
							href="http://lucas-avendano.netlify.app/"
							target="_blank"
							rel="noopener noreferrer"
							className="font-bold transition-colors text-white/80 hover:text-butter"
						>
							Lucas Avendaño
						</a>
					</span>
				</div>
			</div>
		</footer>
	);
}
