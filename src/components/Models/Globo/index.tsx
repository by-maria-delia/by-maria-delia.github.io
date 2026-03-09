import bodyImg from "../../../assets/Globo/body.png";
import topImg from "../../../assets/Globo/borders.png";
import { cn } from "../../../utils/cn";
import MaskedModelPart from "../MaskedModelPart";

export default function Globo({
	bg1,
	bg2,
	className,
}: {
	bg1?: string;
	bg2?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"w-full max-w-50 relative h-63.25 model-mask-shadow",
				className,
			)}
		>
			<MaskedModelPart mask={bodyImg} bg={bg1} />
			<MaskedModelPart
				mask={topImg}
				bg={bg2}
				className="bg-position-[5px_5px]"
			/>
		</div>
	);
}
