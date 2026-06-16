import { useSiteContent } from "../data";
import FadeUp from "./FadeUp";

export default function DeliveryInfo() {
	const { delivery } = useSiteContent();

	return (
		<section className="px-5 py-17.5 text-center bg-mint">
			<FadeUp className="max-w-6xl mx-auto">
				<div className="grid w-19.5 h-19.5 mx-auto mb-6 bg-white rounded-full shadow-lg place-items-center text-pink-deep shadow-ink/12">
					<svg
						className="w-10 h-10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={1.6}
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M21 8.25c0-2.5-2.1-4.5-4.7-4.5-1.9 0-3.6 1.1-4.3 2.7-.7-1.6-2.4-2.7-4.3-2.7C5.1 3.75 3 5.76 3 8.25c0 7.2 9 12 9 12s9-4.78 9-12z"
						/>
					</svg>
				</div>

				<h2 className="text-[clamp(2.4rem,7vw,3.6rem)] text-[#2f6048] mb-4">
					{delivery.heading}
				</h2>

				<div>
					{delivery.paragraphs.map((paragraph) => (
						<p
							key={paragraph}
							className="max-w-[48ch] mx-auto mt-2.5 text-lg font-semibold text-[#33614b] first:mt-0"
						>
							{paragraph}
						</p>
					))}
				</div>

				<p className="mt-6 text-3xl font-display text-mint-deep">
					{delivery.footnote}
				</p>
			</FadeUp>
		</section>
	);
}
