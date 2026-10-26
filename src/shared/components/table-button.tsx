import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";
export function TableButton({
	className,
	onClick,
	type = "button",
	...props
}: ComponentProps<"button">) {
	return (
		<button
			{...props}
			type={type}
			title={props.title ?? props["aria-label"]}
			data-slot="table-button"
			className={cn(
				"cursor-pointer rounded-sm px-1 -mx-1 text-foreground text-left transition-colors underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			onClick={(event) => {
				event.stopPropagation();
				onClick?.(event);
			}}
		/>
	);
}
