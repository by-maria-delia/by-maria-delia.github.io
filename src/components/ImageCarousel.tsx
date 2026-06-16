import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/zoom";
import { Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import useIsMobile from "../hooks/useIsMobile";
import type { CarouselImage } from "../types";
import { cn } from "../utils/cn";
import ImagePlaceholder from "./ImagePlaceholder";

const ZOOM = 2;

interface ImageCarouselProps {
	images: CarouselImage[];
	productName: string;
	className?: string;
}

export default function ImageCarousel({
	images,
	productName,
	className,
}: ImageCarouselProps) {
	const isMobile = useIsMobile();
	const [isZoomed, setIsZoomed] = useState(false);
	const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
	const [activeIndex, setActiveIndex] = useState(0);
	const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	if (images.length === 0) return null;

	const hasMultiple = images.length > 1;
	const canZoom = !isMobile && !images[activeIndex]?.placeholder;

	const handleMouseEnter = () => {
		if (canZoom) setIsZoomed(true);
	};
	const handleMouseLeave = () => setIsZoomed(false);
	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!canZoom || !containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		setZoomOrigin({
			x: ((e.clientX - rect.left) / rect.width) * 100,
			y: ((e.clientY - rect.top) / rect.height) * 100,
		});
	};

	return (
		<div className={className}>
			{/* Relative wrapper: nav arrows are positioned here, outside Swiper's overflow-hidden.
			    Desktop side gutters (md:px-12) keep the arrows beside the image, not on top of it,
			    so the hover-zoom boundary is never crossed and no image content is hidden. */}
			<div className="relative md:px-9">
				{/* Mouse event boundary for desktop hover zoom */}
				<div
					ref={containerRef}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onMouseMove={handleMouseMove}
					className={cn(isZoomed ? "cursor-crosshair" : "")}
				>
					<Swiper
						modules={[Zoom]}
						zoom={isMobile ? { maxRatio: 3 } : false}
						loop={hasMultiple}
						allowTouchMove={!isZoomed}
						onSwiper={setSwiperInstance}
						onRealIndexChange={(swiper) => {
							setActiveIndex(swiper.realIndex);
							setIsZoomed(false);
						}}
						className="overflow-hidden rounded-2xl aspect-4/3 bg-sand"
					>
						{images.map((image, i) => {
							const imgSrc = image.src;
							const isActive = i === activeIndex;
							return (
								<SwiperSlide
									// biome-ignore lint/suspicious/noArrayIndexKey: index is stable for a static images array
									key={i}
									className="flex items-center justify-center bg-sand"
								>
									{image.placeholder ? (
										<ImagePlaceholder />
									) : (
										<>
											{/* swiper-zoom-container: Swiper Zoom module targets this on mobile */}
											<div className="swiper-zoom-container w-full h-full flex items-center justify-center">
												<img
													src={imgSrc}
													alt={`${productName} ${i + 1}`}
													className={cn("w-full h-full object-contain", {
														"opacity-0": isZoomed && isActive,
													})}
												/>
											</div>
											{/* Desktop-only hover zoom overlay - always opacity-0 on mobile */}
											{!isMobile && (
												<img
													src={imgSrc}
													alt=""
													aria-hidden={true}
													className={cn(
														"absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-200 opacity-0",
														{ "opacity-100": isZoomed && isActive },
													)}
													style={
														isZoomed && isActive
															? {
																	transform: `scale(${ZOOM})`,
																	transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
																}
															: undefined
													}
												/>
											)}
										</>
									)}
								</SwiperSlide>
							);
						})}
					</Swiper>
				</div>

				{/* Nav arrows: siblings of the zoom area so hovering them doesn't trigger zoom */}
				{hasMultiple && (
					<>
						<button
							type="button"
							aria-label="Imagen anterior"
							onClick={() => swiperInstance?.slidePrev()}
							className="absolute z-10 grid w-10 h-10 md:w-9 md:h-9 transition rounded-full shadow left-2.5 md:left-0 top-1/2 -translate-y-1/2 place-items-center cursor-pointer bg-white/90 hover:bg-white text-ink btn-press"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
								<path
									d="M15 18l-6-6 6-6"
									stroke="currentColor"
									strokeWidth={2.4}
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
						<button
							type="button"
							aria-label="Imagen siguiente"
							onClick={() => swiperInstance?.slideNext()}
							className="absolute z-10 grid w-10 h-10 md:w-9 md:h-9 transition rounded-full shadow right-2.5 md:right-0 top-1/2 -translate-y-1/2 place-items-center cursor-pointer bg-white/90 hover:bg-white text-ink btn-press"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
								<path
									d="M9 18l6-6-6-6"
									stroke="currentColor"
									strokeWidth={2.4}
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</>
				)}
			</div>

			{/* Pagination dots: below the image, never inside the zoom area */}
			{hasMultiple && (
				<div
					className="flex justify-center mt-1"
					role="tablist"
					aria-label="Imágenes del producto"
				>
					{images.map((_, i) => (
						<button
							// biome-ignore lint/suspicious/noArrayIndexKey: index is stable for a static images array
							key={i}
							type="button"
							role="tab"
							aria-selected={i === activeIndex}
							aria-label={`Imagen ${i + 1} de ${images.length}`}
							onClick={() => swiperInstance?.slideToLoop(i)}
							className="p-2 cursor-pointer group"
						>
							<span
								className={`block w-2 h-2 rounded-full transition-colors ${
									i === activeIndex
										? "bg-pink-deep"
										: "bg-ink/25 group-hover:bg-ink/40"
								}`}
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
