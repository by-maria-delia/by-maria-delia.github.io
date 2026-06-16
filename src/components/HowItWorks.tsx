import { useSiteContent } from "../data";
import FadeUp from "./FadeUp";

/** Step icons live in code (not copy); they pair with the steps by index (cycled with i % 4). */
const stepIcons = [
	<path
		key="0"
		strokeLinecap="round"
		strokeLinejoin="round"
		d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.36-1.99l1.26 12c.07.66-.45 1.24-1.12 1.24H4.25a1.12 1.12 0 01-1.12-1.24l1.26-12A1.12 1.12 0 015.51 7.5h12.98c.58 0 1.06.44 1.12 1.01z"
	/>,
	<path
		key="1"
		strokeLinecap="round"
		strokeLinejoin="round"
		d="M9.53 16.12a3 3 0 00-5.78 1.13 2.25 2.25 0 01-2.4 2.24 4.5 4.5 0 008.4-2.24M9.53 16.12c1.1-.4 2.2-.95 3.39-1.62m-5.04-.02a16 16 0 011.62-3.4m3.42 3.42a16 16 0 004.76-4.65l3.88-5.81a1.15 1.15 0 00-1.6-1.6L14.15 6.32a16 16 0 00-4.65 4.76m3.42 3.42a6.78 6.78 0 00-3.42-3.42"
	/>,
	<path
		key="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		d="M21 12c0 4.56-4.03 8.25-9 8.25a9.76 9.76 0 01-2.56-.34A6 6 0 015.4 21c-.16-.02-.32-.04-.47-.06.43-.5.78-1.2.98-2.03.09-.46-.13-.9-.47-1.23C3.93 16.18 3 14.19 3 12c0-4.56 4.03-8.25 9-8.25s9 3.69 9 8.25z"
	/>,
	<path
		key="3"
		strokeLinecap="round"
		strokeLinejoin="round"
		d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.88A2.62 2.62 0 109.38 7.5H12m0-2.62V7.5m0-2.62A2.62 2.62 0 1114.63 7.5H12m0 0V21m-8.62-9.75h18c.62 0 1.12-.5 1.12-1.12v-1.5c0-.63-.5-1.13-1.12-1.13h-18c-.62 0-1.12.5-1.12 1.13v1.5c0 .62.5 1.12 1.12 1.12z"
	/>,
];

const bubbleColors = [
	"bg-pink-deep",
	"bg-butter-deep",
	"bg-sky-deep",
	"bg-mint-deep",
];

export default function HowItWorks() {
	const { howItWorks } = useSiteContent();

	return (
		<>
			<section id="como-encargar" className="px-5 py-17.5 bg-sky">
				<div className="max-w-6xl mx-auto">
					<FadeUp className="max-w-xl mx-auto mb-12 text-center">
						<span className="inline-block px-4 py-1.5 mb-3 text-sm font-bold bg-white rounded-full font-head text-sky-ink">
							¡súper fácil!
						</span>
						<h2 className="text-[clamp(2.2rem,6.5vw,3.4rem)] text-sky-ink my-3">
							{howItWorks.heading}
						</h2>
						<p className="text-lg font-semibold text-sky-ink/80">
							{howItWorks.subheading}
						</p>
					</FadeUp>

					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{howItWorks.steps.map((step, idx) => {
							const i = idx % 4;
							return (
								<FadeUp
									key={step.title}
									delay={i * 80}
									className="relative p-6 text-center transition-transform bg-white shadow-lg rounded-3xl hover:-translate-y-1.5 shadow-ink/8"
								>
									<div
										className={`relative grid w-18.5 h-18.5 mx-auto mb-4 text-white rounded-full place-items-center ${bubbleColors[i]}`}
									>
										<span className="absolute grid -top-1.5 -right-1.5 w-7.5 h-7.5 text-ink bg-white rounded-full shadow place-items-center font-head font-extrabold text-[.95rem]">
											{idx + 1}
										</span>
										<svg
											className="w-8 h-8"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											aria-hidden="true"
										>
											{stepIcons[i]}
										</svg>
									</div>
									<h3 className="mb-1.5 text-xl text-ink font-head">
										{step.title}
									</h3>
									<p className="text-[.95rem] font-semibold text-muted">
										{step.desc}
									</p>
								</FadeUp>
							);
						})}
					</div>

					<p className="mt-8 font-semibold text-center text-sky-ink/85">
						{howItWorks.footnote}
					</p>
				</div>
			</section>

			{/* trailing wave: bg-sky flows into the next section (bg-cream) */}
			<svg
				className="block w-full h-13.5 fill-sky bg-cream rotate-180"
				viewBox="0 0 1440 54"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<path d="M0,30 C180,54 360,54 540,36 C720,18 900,0 1080,12 C1260,24 1380,42 1440,30 L1440,54 L0,54 Z" />
			</svg>
		</>
	);
}
