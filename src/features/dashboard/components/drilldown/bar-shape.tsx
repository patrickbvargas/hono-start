import { type BarShapeProps, Rectangle } from "recharts";

interface DrilldownBarShapeProps extends BarShapeProps {
	label: string;
	onActivate?: (trigger: SVGElement) => void;
}

export function DrilldownBarShape({
	label,
	onActivate,
	...props
}: DrilldownBarShapeProps) {
	if (!onActivate) {
		return <Rectangle {...props} />;
	}
	return (
		<g
			role="button"
			tabIndex={0}
			aria-label={`Detalhar ${label}`}
			data-drilldown-index={props.index}
			className="cursor-pointer outline-none [&_.recharts-rectangle]:transition-[filter,stroke,stroke-width] hover:[&_.recharts-rectangle]:brightness-110 hover:[&_.recharts-rectangle]:stroke-foreground hover:[&_.recharts-rectangle]:stroke-2 focus-visible:[&_.recharts-rectangle]:brightness-110 focus-visible:[&_.recharts-rectangle]:stroke-foreground focus-visible:[&_.recharts-rectangle]:stroke-2"
			onClick={(event) => {
				event.stopPropagation();
				onActivate(event.currentTarget);
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onActivate(event.currentTarget);
				}
			}}
		>
			<title>{`Ver detalhes: ${label}`}</title>
			<Rectangle {...props} />
		</g>
	);
}
