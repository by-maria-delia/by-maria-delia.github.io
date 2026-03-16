export default function DeliveryInfo() {
	return (
		<section className="relative px-4 py-24 overflow-hidden bg-cream/50">
			{/* Ambient gradient */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-school-blue/5 rounded-full blur-[80px]" />
			</div>

			<div className="relative max-w-2xl mx-auto text-center">
				<div className="inline-flex items-center justify-center mb-6 w-14 h-14 rounded-2xl bg-school-blue/10 text-denim-blue">
					<svg
						className="w-7 h-7"
						fill="none"
						stroke="currentColor"
						strokeWidth={1.5}
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
						/>
					</svg>
				</div>

				<h2 className="mb-8 text-4xl tracking-tight font-display md:text-5xl text-denim-blue">
					Hecho a mano
				</h2>

				<div className="space-y-4 text-lg leading-relaxed text-dark-text/75">
					<p>Cada guardapolvo se confecciona especialmente para vos.</p>
					<p>Los tiempos de entrega pueden variar según demanda y modelo.</p>
				</div>

				<p className="mt-8 text-xl font-handwritten text-denim-blue/70">
					Gracias por elegir trabajo artesanal
				</p>
			</div>
		</section>
	);
}
