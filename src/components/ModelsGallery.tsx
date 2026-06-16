import { useState } from "react";
import { useProducts } from "../data";
import type { Product } from "../types";
import Customizer from "./Customizer";
import FadeUp from "./FadeUp";
import ProductCard from "./ProductCard";

export default function ModelsGallery() {
	const { data } = useProducts();
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	const products = data.filter((product) => product.disponible);

	return (
		<section id="modelos" className="px-5 py-17.5 bg-cream">
			<div className="max-w-6xl mx-auto">
				<div className="max-w-xl mx-auto mb-12 text-center">
					<FadeUp>
						<span className="inline-block px-4 py-1.5 mb-3 text-sm font-bold rounded-full font-head bg-pink text-pink-deep">
							elegí el tuyo
						</span>
						<h2 className="text-[clamp(2.2rem,6.5vw,3.4rem)] text-ink my-3">
							Nuestros modelos
						</h2>
						<p className="text-lg font-semibold text-muted">
							Cada uno se puede personalizar con tu talle, bolsillo y estampado
							favorito.
						</p>
					</FadeUp>
				</div>

				<div className="grid grid-cols-1 gap-4 min-[435px]:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
					{products.map((product, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: index is fine here since products won't be reordered or filtered
						<FadeUp key={product.nombre + idx} delay={Math.min(idx, 4) * 70}>
							<ProductCard
								product={product}
								index={idx}
								onCustomize={setSelectedProduct}
							/>
						</FadeUp>
					))}
				</div>
			</div>

			{selectedProduct && (
				<Customizer
					product={selectedProduct}
					onClose={() => setSelectedProduct(null)}
				/>
			)}
		</section>
	);
}
