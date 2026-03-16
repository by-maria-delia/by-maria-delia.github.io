import FadeUp from "./FadeUp";

export default function Hero() {
	return (
		<section className="relative overflow-hidden bg-spanish-white min-h-[85dvh] flex items-center px-4">
			{/* Ambient background — soft radial gradients */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-0 left-1/4 w-150 h-150 bg-school-blue/8 rounded-full blur-[120px]" />
				<div className="absolute bottom-0 right-1/4 w-125 h-125 bg-teacher-pink/6 rounded-full blur-[100px]" />
			</div>

			<div className="relative w-full max-w-3xl mx-auto">
				<FadeUp>
					<p className="mb-4 text-lg font-handwritten text-denim-blue">
						Hechos a mano, pensados para vos
					</p>
				</FadeUp>

				<FadeUp delay={100}>
					<h1 className="font-display text-7xl sm:text-8xl md:text-9xl text-denim-blue mb-6 leading-[0.9] tracking-tight">
						Maria Delia
					</h1>
				</FadeUp>

				<FadeUp delay={200}>
					<p className="max-w-md mb-12 text-lg leading-relaxed md:text-xl text-denim-blue/80">
						Guardapolvos artesanales y personalizables para maestras jardineras
					</p>
				</FadeUp>

				<FadeUp delay={300}>
					<div className="flex flex-col gap-4 sm:flex-row">
						<a
							href="#modelos"
							className="btn-press inline-flex items-center justify-center bg-denim-blue text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-denim-blue/90 hover:shadow-lg hover:shadow-denim-blue/20 transition-all"
						>
							Ver modelos
						</a>
						<a
							href="#como-encargar"
							className="btn-press inline-flex items-center justify-center border-2 border-denim-blue/25 text-denim-blue font-semibold px-8 py-3.5 rounded-lg hover:border-denim-blue/50 hover:bg-denim-blue/5 transition-all"
						>
							Cómo encargar
						</a>
					</div>
				</FadeUp>
			</div>
		</section>
	);
}
