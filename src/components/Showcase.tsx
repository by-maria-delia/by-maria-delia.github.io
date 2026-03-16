import { useGalleryImages } from "../data";
import { driveImageUrl } from "../hooks/useDriveFolder";
import FadeUp from "./FadeUp";

export default function Showcase() {
	// TODO: handle error/loading states
	const { images: galleryImages } = useGalleryImages();

	if (galleryImages.length === 0) return null;

	return (
		<section id="galeria" className="px-4 py-24 bg-soft-white">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-14">
					<h2 className="mb-3 text-4xl tracking-tight font-display md:text-5xl text-denim-blue">
						Nuestros trabajos
					</h2>
					<p className="max-w-md mx-auto text-soft-gray">
						Algunos modelos personalizados que ya entregamos
					</p>
				</div>

				{/* Masonry-style grid with varied aspect ratios */}
				<div className="gap-4 space-y-4 columns-2 md:columns-3">
					{galleryImages.map((image, idx) => (
						<FadeUp
							key={image.id}
							delay={Math.min(idx, 4) * 80}
							className="group relative break-inside-avoid rounded-xl overflow-hidden bg-cream"
						>
							<img
								src={driveImageUrl(image.id)}
								alt={image.name}
								loading="lazy"
								className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
							/>
						</FadeUp>
					))}
				</div>
			</div>
		</section>
	);
}
