import type { Product } from "../types";
import { formatPrice } from "../utils/formatPrice";
import ImagePlaceholder from "./ImagePlaceholder";

interface ProductCardProps {
	product: Product;
	index: number;
	onCustomize: (product: Product) => void;
}

const cardBorder = [
	"border-pink",
	"border-sky",
	"border-butter",
	"border-mint",
];

const cardImgBg = ["bg-pink/40", "bg-sky/40", "bg-butter/40", "bg-mint/40"];

export default function ProductCard({
	product,
	index,
	onCustomize,
}: ProductCardProps) {
	const imageSrc = product.imagenes[0] ?? null;
	const price = formatPrice(product);
	const variant = index % 4;

	return (
		<article
			className={`relative flex flex-col overflow-hidden transition-all bg-white border-[3px] rounded-3xl group hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-ink/13 ${cardBorder[variant]}`}
		>
			<div
				className={`relative overflow-hidden aspect-square ${cardImgBg[variant]}`}
			>
				{price && (
					<span className="absolute z-10 px-3 py-1.5 text-ink bg-white rounded-full shadow top-3 right-3 font-head font-extrabold text-[.92rem] rotate-[4deg]">
						{price}
					</span>
				)}
				{imageSrc ? (
					<img
						src={imageSrc}
						alt={product.nombre}
						loading="lazy"
						className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<ImagePlaceholder />
				)}
			</div>

			<div className="flex flex-col flex-1 p-4 text-center">
				<h3 className="mb-3 text-xl font-head text-ink">{product.nombre}</h3>
				<button
					type="button"
					onClick={() => onCustomize(product)}
					className="w-full py-3 mt-auto text-sm font-bold text-white transition-colors rounded-xl btn-press bg-sky-deep hover:bg-sky-ink cursor-pointer"
				>
					Ver y personalizar
				</button>
			</div>
		</article>
	);
}
