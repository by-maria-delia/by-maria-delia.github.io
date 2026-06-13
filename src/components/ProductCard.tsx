import type { Product } from "../types";
import { formatPrice } from "../utils/formatPrice";
import ImagePlaceholder from "./ImagePlaceholder";

interface ProductCardProps {
	product: Product;
	onCustomize: (product: Product) => void;
}

export default function ProductCard({
	product,
	onCustomize,
}: ProductCardProps) {
	const imageSrc = product.imagenes[0] ?? null;
	const price = formatPrice(product);

	return (
		<div className="flex flex-col overflow-hidden transition-all border group bg-soft-white rounded-xl border-denim-blue/8 hover:border-school-blue/25 hover:shadow-lg hover:shadow-school-blue/8">
			<div className="overflow-hidden aspect-square bg-cream">
				{imageSrc ? (
					<img
						src={imageSrc}
						alt={product.nombre}
						loading="lazy"
						className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-700 ease-out"
					/>
				) : (
					<ImagePlaceholder />
				)}
			</div>

			<div className="flex flex-col flex-1 p-3 md:p-4">
				<h3 className="mb-0.5 text-base font-semibold tracking-tight text-dark-text">
					{product.nombre}
				</h3>

				<div className="mt-auto">
					{price && (
						<p className="mb-3 text-base md:text-lg font-bold text-denim-blue tabular-nums">
							{price}
						</p>
					)}
					<button
						type="button"
						onClick={() => onCustomize(product)}
						className="btn-press w-full bg-denim-blue text-white font-semibold py-2 text-sm rounded-lg hover:bg-denim-blue/90 hover:shadow-md hover:shadow-denim-blue/15 transition-all cursor-pointer"
					>
						Ver y personalizar
					</button>
				</div>
			</div>
		</div>
	);
}
