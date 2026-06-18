import { useEffect, useRef, useState } from "react";
import SizeGuideImg from "../assets/sizes_guide.png";
import {
	useBaseImages,
	usePocketsImages,
	useProductsDetails,
	useStampImages,
} from "../data";
import useIsMobile from "../hooks/useIsMobile";
import type { CarouselImage, Product } from "../types";
import { track } from "../utils/analytics";
import { cn } from "../utils/cn";
import { formatPrice } from "../utils/formatPrice";
import { buildWhatsAppURL } from "../utils/whatsapp";
import ImageCarousel from "./ImageCarousel";

interface CustomizerProps {
	product: Product;
	onClose: () => void;
}

function CheckTick() {
	return (
		<span className="absolute top-1.5 right-1.5 z-10 flex items-center justify-center w-5 h-5 rounded-full shadow-sm pointer-events-none bg-pink-deep">
			<svg
				className="w-3 h-3 text-white"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={3}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M5 13l4 4L19 7" />
			</svg>
		</span>
	);
}

export default function Customizer({ product, onClose }: CustomizerProps) {
	const [size, setSize] = useState("");
	const [pockets, setPockets] = useState("");
	const [estampado, setEstampado] = useState("");
	const [base, setBase] = useState("");
	const [comments, setComments] = useState("");

	const isMobile = useIsMobile();

	const { images: stampImages } = useStampImages();
	const { images: pocketsImages } = usePocketsImages();
	const { images: baseImages } = useBaseImages();
	const { data: productDetails } = useProductsDetails();
	const price = formatPrice(product);
	const carouselImages: CarouselImage[] = [
		...(product.imagenes.length > 0
			? product.imagenes.map((src) => ({ src, name: product.nombre }))
			: [{ src: "", name: "Imagen no disponible", placeholder: true }]),
		{ src: SizeGuideImg, name: "Guía de talles" },
	];

	const sizes = productDetails?.talles
		? productDetails.talles.split(",").map((s) => s.trim())
		: ["XS", "S", "M", "L", "XL", "XXL"];

	const isValid = size && pockets && estampado && base;
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
			// Pause when a child overlay (e.g. image lightbox) owns the focus loop.
			if (document.querySelector("[data-lightbox-active]")) return;
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
			if (document.querySelector("[data-lightbox-active]")) return;
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
		track("whatsapp_click", {
			model_name: product.nombre,
			size,
			base,
			pockets,
			estampado,
		});
		const url = buildWhatsAppURL({
			model_name: product.nombre,
			size,
			pockets,
			tipo_de_estampado: estampado,
			base,
			extra_comments: comments,
		});
		window.open(url, "_blank");
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center bg-ink/40 backdrop-blur-sm sm:p-4 animate-fade-in in-view"
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
				className={cn(
					"flex flex-col w-full overflow-hidden bg-white outline-none max-w-7xl max-h-[92dvh] rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-ink/10",
					isMobile ? "animate-sheet-up" : "animate-fade-up in-view",
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between shrink-0 px-6 py-4 bg-white border-b border-ink/10">
					<h3
						id="customizer-title"
						className="text-2xl font-display text-sky-ink"
					>
						Personalizá tu guardapolvo
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="grid w-10 h-10 transition-colors rounded-full cursor-pointer place-items-center bg-sand text-muted hover:bg-pink-deep/10 hover:text-pink-deep btn-press"
						aria-label="Cerrar"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2.2}
							strokeLinecap="round"
						>
							<path d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="p-5 overflow-y-auto md:p-6 md:grid md:grid-cols-2 md:gap-7 md:overflow-hidden">
					{/* Product images */}
					<ImageCarousel
						images={carouselImages}
						productName={product.nombre}
						className="md:overflow-hidden"
					/>

					<div className="flex flex-col gap-4 md:overflow-y-auto md:pr-2">
						<div className="flex items-baseline justify-between gap-3 mt-4 md:mt-0">
							<h4 className="text-4xl font-display text-sky-ink">
								{product.nombre}
							</h4>
							{/* Price */}
							{price && (
								<span className="text-2xl font-bold font-head text-ink tabular-nums whitespace-nowrap">
									{price}
								</span>
							)}
						</div>

						{/* Description */}
						{product.descripcion && (
							<p className="leading-relaxed text-muted">
								{product.descripcion}
							</p>
						)}

						{/* Size selector */}
						{sizes.length > 0 && (
							<fieldset className="flex flex-col gap-2.5">
								<legend className="font-bold font-head text-ink">
									1 · Talle <span className="text-pink-deep">*</span>
								</legend>
								<div className="flex flex-wrap gap-2.5">
									{sizes.map((s) => (
										<button
											type="button"
											key={s}
											onClick={() => setSize(s)}
											className={cn(
												"btn-press px-5 py-2.5 rounded-lg text-sm font-bold border-2 transition-all cursor-pointer",
												size === s
													? "bg-pink-deep text-white border-pink-deep shadow-md"
													: "bg-sand border-ink/15 text-ink hover:border-pink-deep/50 hover:bg-pink-deep/8",
											)}
										>
											{s}
										</button>
									))}
								</div>
							</fieldset>
						)}

						{/* Base selector */}
						{baseImages.length > 0 && (
							<fieldset className="flex flex-col gap-2.5 min-w-0">
								<legend className="font-bold font-head text-ink">
									2 · Base <span className="text-pink-deep">*</span>
								</legend>
								<div className="flex gap-3 px-1 py-2.5 overflow-x-auto custom-scrollbar">
									{baseImages.map((image) => {
										const displayName = image.nombre;
										const selected = base === displayName;
										return (
											<button
												type="button"
												key={image.nombre}
												onClick={() => setBase(displayName)}
												className={cn(
													"flex flex-col btn-press relative rounded-xl border-2 overflow-hidden transition-all shrink-0 w-28 cursor-pointer",
													selected
														? "border-pink-deep ring-2 ring-pink-deep/20 shadow-md"
														: "border-ink/15 hover:border-pink-deep/30",
												)}
											>
												{selected && <CheckTick />}
												<div className="bg-sand">
													<img
														src={image.imagen}
														alt={displayName}
														loading="lazy"
														className="object-contain w-full h-22"
													/>
												</div>
												<p className="p-2 text-xs font-bold leading-tight text-center text-ink">
													{displayName}
												</p>
											</button>
										);
									})}
								</div>
							</fieldset>
						)}

						{/* Pockets selector */}
						{pocketsImages.length > 0 && (
							<fieldset className="flex flex-col gap-2.5 min-w-0">
								<legend className="font-bold font-head text-ink">
									3 · Tipo de bolsillo <span className="text-pink-deep">*</span>
								</legend>
								<div className="flex gap-3 px-1 py-2.5 overflow-x-auto custom-scrollbar">
									{pocketsImages.map((image) => {
										const displayName = image.nombre;
										const selected = pockets === displayName;
										return (
											<button
												type="button"
												key={image.nombre}
												onClick={() => setPockets(displayName)}
												className={cn(
													"flex flex-col btn-press relative rounded-xl border-2 overflow-hidden transition-all shrink-0 w-28 cursor-pointer",
													selected
														? "border-pink-deep ring-2 ring-pink-deep/20 shadow-md"
														: "border-ink/15 hover:border-pink-deep/30",
												)}
											>
												{selected && <CheckTick />}
												<div className="bg-sand">
													<img
														src={image.imagen}
														alt={displayName}
														loading="lazy"
														className="object-contain w-full h-22"
													/>
												</div>
												<p className="p-2 text-xs font-bold leading-tight text-center text-ink">
													{displayName}
												</p>
											</button>
										);
									})}
								</div>
							</fieldset>
						)}

						{/* Estampado selector */}
						{stampImages.length > 0 && (
							<fieldset className="flex flex-col gap-2.5 min-w-0">
								<legend className="font-bold font-head text-ink">
									4 · Estampado del bolsillo{" "}
									<span className="text-pink-deep">*</span>
								</legend>
								<div className="flex gap-3 px-1 py-2.5 overflow-x-auto custom-scrollbar">
									{stampImages.map((image) => {
										const displayName = image.nombre;
										const selected = estampado === displayName;
										return (
											<button
												type="button"
												key={image.nombre}
												onClick={() => setEstampado(displayName)}
												className={cn(
													"flex flex-col btn-press relative rounded-xl border-2 overflow-hidden transition-all shrink-0 w-28 cursor-pointer",
													selected
														? "border-pink-deep ring-2 ring-pink-deep/20 shadow-md"
														: "border-ink/15 hover:border-pink-deep/30",
												)}
											>
												{selected && <CheckTick />}
												<div className="bg-sand">
													<img
														src={image.imagen}
														alt={displayName}
														loading="lazy"
														className="object-cover w-full h-28"
													/>
												</div>
												<p className="p-2 text-xs font-bold leading-tight text-center text-ink">
													{displayName}
												</p>
											</button>
										);
									})}
								</div>
							</fieldset>
						)}

						{/* Comments */}
						<div className="flex flex-col gap-2.5">
							<label
								htmlFor="comments"
								className="text-sm font-bold font-head text-ink"
							>
								Comentarios adicionales
							</label>
							<textarea
								id="comments"
								value={comments}
								onChange={(e) => setComments(e.target.value)}
								placeholder="Ej: quiero el nombre bordado, talle especial, etc."
								rows={3}
								className="w-full px-4 py-3 text-base transition-all border-2 resize-none rounded-xl border-line text-ink placeholder:text-muted/60 focus:outline-none focus:border-pink-deep focus:ring-2 focus:ring-pink-deep/15 bg-white"
							/>
						</div>

						{/* Submit button */}
						<button
							type="button"
							onClick={handleSubmit}
							disabled={!isValid}
							className={cn(
								"btn-press w-full py-3.5 rounded-xl font-head font-bold text-white transition-colors",
								isValid
									? "bg-mint-deep hover:bg-mint-deep/90 hover:shadow-lg hover:shadow-mint-deep/20 cursor-pointer animate-button-ready"
									: "bg-ink/15 text-ink/40 cursor-not-allowed",
							)}
						>
							<span className="flex items-center justify-center gap-2.5">
								<svg
									className="w-5.5 h-5.5"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
									<path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.104 1.519 5.834L0 24l6.335-1.478A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.09-1.42l-.365-.217-3.786.993.992-3.622-.237-.377A9.792 9.792 0 012.182 12 9.818 9.818 0 0112 2.182 9.818 9.818 0 0121.818 12 9.818 9.818 0 0112 21.818z" />
								</svg>
								Enviar pedido por WhatsApp
							</span>
						</button>

						<p
							className={cn("text-sm text-center text-muted", {
								"font-bold text-mint-deep animate-listo-in": isValid,
							})}
						>
							{isValid
								? "¡Todo listo para enviar!"
								: "Seleccioná talle, bolsillo, estampado y base para continuar."}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
