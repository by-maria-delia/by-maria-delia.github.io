import { useSiteContent } from "../data";
import FadeUp from "./FadeUp";

export default function Hero() {
	const { brandName, tagline, hero } = useSiteContent();

	return (
		<section
			className="relative overflow-hidden"
			style={{
				background:
					"linear-gradient(160deg,#FDF1F5 0%,#EAF4FA 60%,#EFF7F1 100%)",
			}}
		>
			{/* Decorative blurred blobs */}
			<span className="absolute rounded-full pointer-events-none w-37.5 h-37.5 bg-pink/55 blur-[2px] left-[6%] top-[18%]" />
			<span className="absolute rounded-full pointer-events-none w-22.5 h-22.5 bg-mint/55 blur-[2px] left-[46%] top-[8%]" />
			<span className="absolute rounded-full pointer-events-none w-30 h-30 bg-sky/55 blur-[2px] right-[8%] bottom-[10%]" />

			<div className="grid items-center max-w-6xl gap-9 px-5 py-11 mx-auto md:grid-cols-[1.05fr_0.95fr] md:py-20">
				<FadeUp>
					<span className="inline-block px-4 py-1.5 mb-4 text-sm font-bold bg-white rounded-full shadow-md font-head text-pink-deep shadow-ink/8">
						{hero.eyebrow}
					</span>
					<h1 className="relative z-10 font-display text-[clamp(4.4rem,17vw,8.5rem)] text-sky-ink leading-[0.95] mb-4">
						<span className="absolute -z-1 left-[-2%] bottom-[8%] w-[62%] h-[34%] bg-butter rounded-full opacity-70 -rotate-2" />
						{brandName}
					</h1>
					<p className="max-w-[32ch] mb-7 text-lg font-semibold text-ink">
						{tagline}
					</p>
					<div className="flex flex-wrap gap-3.5">
						<a
							className="btn-press inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold transition-all rounded-full font-head text-white bg-pink-deep shadow-lg shadow-pink-deep/30 hover:-translate-y-0.5"
							href={hero.primaryCta.href}
						>
							{hero.primaryCta.label}
						</a>
						<a
							className="btn-press inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold transition-all rounded-full font-head bg-white text-sky-ink shadow-md shadow-ink/8 hover:bg-sky hover:-translate-y-0.5"
							href={hero.secondaryCta.href}
						>
							{hero.secondaryCta.label}
						</a>
					</div>
				</FadeUp>

				<FadeUp delay={150}>
					<div className="relative w-[min(80%,330px)] justify-self-center md:justify-self-end md:w-[min(100%,380px)]">
						<div
							className="relative overflow-hidden bg-white border-8 border-white shadow-2xl aspect-square shadow-ink/20"
							style={{
								borderRadius: "42% 58% 56% 44%/52% 44% 56% 48%",
							}}
						>
							<img
								src={hero.image}
								alt={hero.imageAlt || "Guardapolvo hecho a mano"}
								className="object-contain w-full h-full"
							/>
						</div>
						<span className="absolute grid w-23 h-23 -right-2 -top-1.5 place-items-center p-2.5 text-center text-white rounded-full shadow-lg font-head font-bold bg-mint-deep text-[.92rem] leading-none -rotate-12 shadow-ink/20">
							¡hecho
							<br />a mano!
						</span>
					</div>
				</FadeUp>
			</div>

			{/* Wave that flows into the next (sky) section */}
			<svg
				className="block w-full h-13.5 fill-sky"
				viewBox="0 0 1440 54"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<path d="M0,30 C180,54 360,54 540,36 C720,18 900,0 1080,12 C1260,24 1380,42 1440,30 L1440,54 L0,54 Z" />
			</svg>
		</section>
	);
}
