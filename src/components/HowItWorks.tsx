import { useSiteContent } from "../data";
import FadeUp from "./FadeUp";

/** Step icons live in code (not copy); they pair with the steps by index. */
const stepIcons = [
	<svg
		key="0"
		className="w-6 h-6"
		fill="none"
		stroke="currentColor"
		strokeWidth={1.5}
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
		/>
	</svg>,
	<svg
		key="1"
		className="w-6 h-6"
		fill="none"
		stroke="currentColor"
		strokeWidth={1.5}
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
		/>
	</svg>,
	<svg
		key="2"
		className="w-6 h-6"
		fill="none"
		stroke="currentColor"
		strokeWidth={1.5}
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
		/>
	</svg>,
	<svg
		key="3"
		className="w-6 h-6"
		fill="none"
		stroke="currentColor"
		strokeWidth={1.5}
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
		/>
	</svg>,
];

export default function HowItWorks() {
	const { howItWorks } = useSiteContent();

	return (
		<section id="como-encargar" className="px-4 py-24 bg-soft-white">
			<div className="max-w-5xl mx-auto">
				<FadeUp className="mb-16 text-center">
					<h2 className="mb-3 text-4xl tracking-tight font-display md:text-5xl text-denim-blue">
						{howItWorks.heading}
					</h2>
					<p className="max-w-md mx-auto text-soft-gray">
						{howItWorks.subheading}
					</p>
				</FadeUp>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{howItWorks.steps.map((step, idx) => (
						<FadeUp
							key={step.title}
							delay={idx * 100}
							className="relative bg-soft-white rounded-2xl p-6 border border-denim-blue/8 hover:border-school-blue/30 transition-all group"
						>
							{/* Step number */}
							<span
								className="absolute text-5xl select-none -top-3 -left-1 font-display text-school-blue"
								aria-hidden="true"
							>
								{idx + 1}
							</span>

							<div className="relative">
								<div className="flex items-center justify-center w-12 h-12 mb-4 transition-colors rounded-xl bg-school-blue/10 text-denim-blue group-hover:bg-school-blue/20">
									{stepIcons[idx]}
								</div>
								<h3 className="mb-2 font-semibold text-dark-text">
									{step.title}
								</h3>
								<p className="text-[15px] leading-relaxed text-soft-gray">
									{step.desc}
								</p>
							</div>
						</FadeUp>
					))}
				</div>

				<p className="mt-12 text-sm text-center text-soft-gray">
					{howItWorks.footnote}
				</p>
			</div>
		</section>
	);
}
