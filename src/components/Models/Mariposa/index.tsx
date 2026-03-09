import bodyImg from "../../../assets/Mariposa/body.png";
import neckImg from "../../../assets/Mariposa/neck.png";
import topImg from "../../../assets/Mariposa/top_and_skirt.png";
import wingsImg from "../../../assets/Mariposa/wings.png";
import { cn } from "../../../utils/cn";
import MaskedModelPart from "../MaskedModelPart";

export default function Mariposa({
	bg1,
	bg2,
	bg3,
	bg4,
	className,
}: {
	bg1?: string;
	bg2?: string;
	bg3?: string;
	bg4?: string;
	className?: string;
}) {
	return (
		<div
			className={cn("max-w-50 relative h-63.25 model-mask-shadow", className)}
		>
			{/* Body */}
			<MaskedModelPart bg={bg1} mask={bodyImg} />

			{/* Top and skirt */}
			<MaskedModelPart bg={bg2} mask={topImg} className="bg-position-[5px]" />

			{/* Neck */}
			<MaskedModelPart bg={bg3} mask={neckImg} />

			{/* Wings */}
			<MaskedModelPart
				bg={bg4}
				mask={wingsImg}
				className="bg-position-[5px_5px]"
			/>
			{/* <div
						style={{
							maskImage: `url(${smockImg2})`,
							backgroundImage: `url("${driveImageUrl(stampImages[index]?.id)}")`,
							// background: `url(${driveImageUrl(stampImages[index]?.id)})`,
						}}
						className="absolute inset-0 bg-size-[200px] mask-no-repeat mask-size-[200px] bg-size-[30px_100px] bg-position-[0_30px]"
					/> */}
		</div>
	);
}
