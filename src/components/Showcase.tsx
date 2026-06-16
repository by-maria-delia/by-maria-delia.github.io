import { useGalleryImages, useSiteContent } from "../data";
import FadeUp from "./FadeUp";

export default function Showcase() {
	const { images: galleryImages } = useGalleryImages();
	const { gallery } = useSiteContent();

	if (galleryImages.length === 0) return null;

	return (
		<>
			{/* leading wave: preceding bg-cream section flows into bg-butter */}
			<svg
				className="block w-full h-13.5 fill-butter bg-cream"
				viewBox="0 0 1440 54"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<path d="M0,24 C180,4 360,4 540,18 C720,32 900,50 1080,42 C1260,34 1380,16 1440,24 L1440,54 L0,54 Z" />
			</svg>

			<section id="galeria" className="px-5 py-17.5 bg-butter">
				<div className="max-w-6xl mx-auto">
					<FadeUp className="max-w-xl mx-auto mb-12 text-center">
						<span className="inline-block px-4 py-1.5 mb-3 text-sm font-bold bg-white rounded-full font-head text-butter-deep">
							mirá nuestros trabajos
						</span>
						<h2 className="text-[clamp(2.2rem,6.5vw,3.4rem)] text-[#7a5f12] my-3">
							{gallery.heading}
						</h2>
						<p className="text-lg font-semibold text-[#7a5f12]/80">
							{gallery.subheading}
						</p>
					</FadeUp>

					<div className="columns-2 md:columns-3 gap-x-4.5">
						{galleryImages.map((image) => (
							<figure
								key={image.imagen}
								className="mb-4.5 break-inside-avoid overflow-hidden bg-white border-[5px] border-white shadow-xl rounded-[22px] rotate-[-1.4deg] even:rotate-[1.6deg] shadow-ink/14"
							>
								<img
									src={image.imagen}
									alt={image.descripcion || "Trabajo de María Delia"}
									loading="lazy"
									className="w-full h-auto"
								/>
							</figure>
						))}
					</div>
				</div>
			</section>

			{/* trailing wave: bg-butter flows into the next section (bg-mint) */}
			<svg
				className="block w-full h-13.5 fill-butter bg-mint rotate-180"
				viewBox="0 0 1440 54"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<path d="M0,24 C180,4 360,4 540,18 C720,32 900,50 1080,42 C1260,34 1380,16 1440,24 L1440,54 L0,54 Z" />
			</svg>
		</>
	);
}
