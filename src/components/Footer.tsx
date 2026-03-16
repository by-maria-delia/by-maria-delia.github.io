import { INSTAGRAM_URL, WHATSAPP_NUMBER } from "../config";

export default function Footer() {
	return (
		<footer id="contacto" className="bg-denim-blue text-white/90">
			<div className="max-w-5xl px-5 mx-auto py-14">
				{/* Top section */}
				<div className="flex flex-col gap-10 mb-12 sm:flex-row sm:items-start sm:justify-between">
					{/* Brand */}
					<div>
						<p className="mb-2 text-3xl tracking-tight text-white font-display">
							Maria Delia
						</p>
						<p className="max-w-xs text-sm text-school-blue/80">
							Guardapolvos artesanales y personalizables para maestras
							jardineras
						</p>
					</div>

					{/* Contact links */}
					<div className="flex flex-col gap-3 text-sm">
						<a
							href={`https://wa.me/${WHATSAPP_NUMBER}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 transition-colors text-white/70 hover:text-white"
						>
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
								<path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.104 1.519 5.834L0 24l6.335-1.478A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.09-1.42l-.365-.217-3.786.993.992-3.622-.237-.377A9.792 9.792 0 012.182 12 9.818 9.818 0 0112 2.182 9.818 9.818 0 0121.818 12 9.818 9.818 0 0112 21.818z" />
							</svg>
							Consultas por WhatsApp
						</a>

						<a
							href={INSTAGRAM_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 transition-colors text-white/70 hover:text-white"
						>
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
							</svg>
							@mariadelia_guardapolvos
						</a>

						<span className="inline-flex items-center gap-2 text-white/60">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								strokeWidth={1.5}
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
								/>
							</svg>
							Hecho en Argentina
						</span>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs border-t border-white/10 sm:flex-row text-white/60">
					<p>
						&copy; {new Date().getFullYear()} Maria Delia. Todos los derechos
						reservados.
					</p>
				</div>
			</div>
		</footer>
	);
}
