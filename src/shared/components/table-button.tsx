import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

interface TableButtonProps extends ComponentProps<"button"> {
	variant?: "link" | "hover";
}
export function TableButton({
	className,
	variant = "link",
	onClick,
	type = "button",
	...props
}: TableButtonProps) {
	return (
		<button
			{...props}
			type={type}
			title={props.title ?? props["aria-label"]}
			data-slot="table-button"
			className={cn(
				"cursor-pointer rounded-sm px-1 -mx-1 text-foreground text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
				variant === "hover"
					? "hover:bg-accent/30 hover:ring-1 hover:ring-ring/60"
					: "underline underline-offset-4",
				className,
			)}
			onClick={(event) => {
				event.stopPropagation();
				onClick?.(event);
			}}
		/>
	);
}
