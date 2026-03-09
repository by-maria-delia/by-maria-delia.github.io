import bgModelPlaceholder from "../../assets/model_bg_placeholder.png";
import { cn } from "../../utils/cn";

interface MaskedModelPartProps extends React.HTMLAttributes<HTMLDivElement> {
	mask: string;
	bg?: string;
	isSelected?: boolean;
}

const MaskedModelPart = ({
	children,
	mask,
	bg,
	className,
	style,
	isSelected,
	...rest
}: MaskedModelPartProps) => (
	<div className="absolute inset-0 model-mask-shadow-inner">
		<div
			style={{
				backgroundImage: bg ? `url(${bg})` : `url(${bgModelPlaceholder})`,
				maskImage: `url(${mask})`,
				...style,
			}}
			className={cn(
				"w-full h-full bg-size-[100%_100%] bg-blend-multiply mask-size-[100%_100%] mask-no-repeat bg-bud",
				{ "bg-white": isSelected },
				className,
			)}
			{...rest}
		>
			{children}
		</div>
	</div>
);

export default MaskedModelPart;
