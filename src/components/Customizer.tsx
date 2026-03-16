import { useEffect, useRef, useState } from "react";
import SizeGuideImg from "../assets/sizes_guide.png";
import { usePocketsImages, useProductsDetails, useStampImages } from "../data";
import { driveImageUrl } from "../hooks/useDriveFolder";
import useIsMobile from "../hooks/useIsMobile";
import type { DriveImage, Product } from "../types";
import { cn } from "../utils/cn";
import { buildWhatsAppURL } from "../utils/whatsapp";
import ImageCarousel from "./ImageCarousel";

interface CustomizerProps {
	product: Product;
	modelImages?: DriveImage[];
	onClose: () => void;
}

const formatImageName = (name: string) =>
	name
		.replace(/\.[^.]+$/, "")
		.replace(/-/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());

export default function Customizer({
	product,
	modelImages,
	onClose,
}: CustomizerProps) {
	const [size, setSize] = useState("");
	const [pockets, setPockets] = useState("");
	const [estampado, setEstampado] = useState("");
	const [comments, setComments] = useState("");

	const isMobile = useIsMobile();

	const { images: stampImages } = useStampImages();
	const { images: pocketsImages } = usePocketsImages();
	const { data: productDetails } = useProductsDetails();
	const carouselImages: DriveImage[] = [
		...(modelImages && modelImages.length > 0
			? modelImages
			: product.imagen
				? [{ id: product.imagen, name: product.nombre }]
				: [{ id: "", name: "Imagen no disponible", placeholder: true }]),
		{ id: "", name: "Guía de talles", url: SizeGuideImg },
	];

	const sizes = productDetails?.talles
		? productDetails.talles.split(",").map((s) => s.trim())
		: ["XS", "S", "M", "L", "XL", "XXL"];

	const isValid = size && pockets && estampado;
	const dialogRef = useRef<HTMLDivElement>(null);

	// Lock body scroll + close on Escape
	useEffect(() => {
		document.body.style.overflow = "hidden";

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = "";
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [onClose]);

	// Focus trap: keep focus inside the dialog at all times
	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		const getFocusable = () =>
			dialog.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);

		// Wrap Tab at boundaries
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;
			const focusable = getFocusable();
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};

		// Pull focus back if it escapes (e.g. browser chrome round-trip)
		const handleFocusIn = (e: FocusEvent) => {
			if (!dialog.contains(e.target as Node)) {
				const focusable = getFocusable();
				if (focusable.length > 0) focusable[0].focus();
				else dialog.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("focusin", handleFocusIn);
		dialog.focus();

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("focusin", handleFocusIn);
		};
	}, []);

	function handleSubmit() {
		if (!isValid) return;
		const url = buildWhatsAppURL({
			model_name: product.nombre,
			size,
			pockets,
			tipo_de_estampado: estampado,
			extra_comments: comments,
		});
		window.open(url, "_blank");
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center bg-dark-text/40 backdrop-blur-sm sm:p-4 animate-fade-in in-view"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="customizer-title"
				tabIndex={-1}
				className="bg-soft-white rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden shadow-2xl shadow-dark-text/10 animate-fade-up in-view flex flex-col outline-none"
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-soft-white border-denim-blue/10">
					<h3
						id="customizer-title"
						className="text-2xl tracking-tight font-display text-denim-blue"
					>
						Crea tu próximo guardapolvo
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="flex items-center justify-center transition-colors rounded-lg cursor-pointer w-9 h-9 hover:bg-denim-blue/8 text-soft-gray"
						aria-label="Cerrar"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div className="p-6 space-y-6 overflow-y-auto md:pr-0 md:flex md:gap-8 md:overflow-hidden">
					{/* Product images */}
					<ImageCarousel
						images={carouselImages}
						productName={product.nombre}
						className="md:w-1/2"
					/>

					<div className="md:px-2 md:w-1/2 md:overflow-y-scroll space-y-4">
						<div className="flex justify-between">
							<h4 className="text-4xl tracking-tight font-display text-denim-blue">
								{product.nombre}
							</h4>
							{/* Price */}
							{product.precio && (
								<p className="text-2xl font-bold text-denim-blue tabular-nums">
									{product.precio}
								</p>
							)}
						</div>

						{/* Description */}
						{product.descripcion && (
							<p className="leading-relaxed text-soft-gray">
								{product.descripcion}
							</p>
						)}

						{/* Size selector */}
						{sizes.length > 0 && (
							<fieldset>
								<legend className="block mb-3 text-sm font-semibold text-dark-text">
									Talle <span className="text-teacher-pink">*</span>
								</legend>
								<div className="flex flex-wrap gap-2">
									{sizes.map((s) => (
										<button
											type="button"
											key={s}
											onClick={() => setSize(s)}
											className={cn(
												"btn-press px-4 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer",
												size === s
													? "bg-denim-blue text-white border-denim-blue shadow-sm"
													: "border-denim-blue/20 text-denim-blue hover:border-denim-blue/40 hover:bg-denim-blue/5",
											)}
										>
											{s}
										</button>
									))}
								</div>
							</fieldset>
						)}

						{/* Pockets selector */}
						{pocketsImages.length > 0 && (
							<fieldset>
								<legend className="block mb-3 text-sm font-semibold text-dark-text">
									Tipo de bolsillo <span className="text-teacher-pink">*</span>
								</legend>
								<div
									className={cn("flex flex-wrap gap-2", {
										"flex-nowrap gap-3 py-2.5 px-1 overflow-x-scroll custom-scrollbar":
											pocketsImages.length > 8 || isMobile,
									})}
								>
									{pocketsImages.map((image) => {
										const displayName = formatImageName(image.name);
										return (
											<button
												type="button"
												key={image.id}
												onClick={() => setPockets(displayName)}
												className={cn(
													"btn-press rounded-xl border overflow-hidden transition-all shrink-0 h-fit max-w-28 cursor-pointer",
													pockets === displayName
														? "border-denim-blue ring-2 ring-denim-blue/20 shadow-sm"
														: "border-denim-blue/12 hover:border-denim-blue/30",
												)}
											>
												<div className="bg-cream">
													<img
														src={driveImageUrl(image.id)}
														alt={displayName}
														loading="lazy"
														className="object-contain w-full h-full"
													/>
												</div>
											</button>
										);
									})}
								</div>
							</fieldset>
						)}

						{/* Estampado selector */}
						{stampImages.length > 0 && (
							<fieldset className="min-w-0">
								<legend className="block mb-3 text-sm font-semibold text-dark-text">
									Tipo de estampado <span className="text-teacher-pink">*</span>
								</legend>
								<div className="flex gap-3 overflow-x-scroll py-2.5 px-1 custom-scrollbar">
									{stampImages.map((image) => {
										const displayName = formatImageName(image.name);
										return (
											<button
												type="button"
												key={image.id}
												onClick={() => setEstampado(displayName)}
												className={cn(
													"btn-press rounded-xl border overflow-hidden transition-all cursor-pointer shrink-0 w-28",
													estampado === displayName
														? "border-denim-blue ring-2 ring-denim-blue/20 shadow-sm"
														: "border-denim-blue/12 hover:border-denim-blue/30",
												)}
											>
												<div className="aspect-square bg-cream">
													<img
														src={driveImageUrl(image.id)}
														alt={displayName}
														loading="lazy"
														className="object-cover w-full h-full"
													/>
												</div>
												<p className="text-xs font-semibold text-dark-text p-2.5 text-center h-full">
													{displayName}
												</p>
											</button>
										);
									})}
								</div>
							</fieldset>
						)}

						{/* Comments */}
						<div>
							<label
								htmlFor="comments"
								className="block mb-3 text-sm font-semibold text-dark-text"
							>
								Comentarios adicionales
							</label>
							<textarea
								id="comments"
								value={comments}
								onChange={(e) => setComments(e.target.value)}
								placeholder="Ej: quiero el nombre bordado, talle especial, etc."
								rows={3}
								className="w-full px-4 py-3 text-base transition-all border resize-none rounded-xl border-denim-blue/15 text-dark-text placeholder:text-soft-gray/50 focus:outline-none focus:border-school-blue focus:ring-2 focus:ring-school-blue/15 bg-soft-white"
							/>
						</div>

						{/* Submit button */}
						<button
							type="button"
							onClick={handleSubmit}
							disabled={!isValid}
							className={cn(
								"btn-press w-full py-3.5 rounded-lg font-semibold text-white transition-all cursor-pointer",
								isValid
									? "bg-leaf-green hover:bg-leaf-green/90 hover:shadow-lg hover:shadow-leaf-green/20"
									: "bg-denim-blue/20 cursor-not-allowed text-denim-blue/40",
							)}
						>
							Finalizar por WhatsApp
						</button>

						{!isValid && (
							<p className="text-xs text-center text-soft-gray">
								Seleccioná talle, color de borde y estampado para continuar.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
