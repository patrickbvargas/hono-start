import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { cn } from "@/shared/lib/utils";

interface ScrollAreaProps extends ScrollAreaPrimitive.Root.Props {
	hideScrollbar?: boolean;
}

function ScrollArea({
	className,
	children,
	hideScrollbar = false,
	...props
}: ScrollAreaProps) {
	return (
		<ScrollAreaPrimitive.Root
			data-slot="scroll-area"
			className={cn(
				"relative",
				!hideScrollbar &&
					"md:data-has-overflow-y:**:data-[slot=scroll-area-viewport]:pr-2",
				className,
			)}
			{...props}
		>
			<ScrollAreaPrimitive.Viewport
				data-slot="scroll-area-viewport"
				className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
			>
				{children}
			</ScrollAreaPrimitive.Viewport>
			{!hideScrollbar && <ScrollBar />}
			{!hideScrollbar && <ScrollBar orientation="horizontal" />}
			<ScrollAreaPrimitive.Corner />
		</ScrollAreaPrimitive.Root>
	);
}

function ScrollBar({
	className,
	orientation = "vertical",
	...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
	return (
		<ScrollAreaPrimitive.Scrollbar
			data-slot="scroll-area-scrollbar"
			data-orientation={orientation}
			orientation={orientation}
			className={cn(
				"flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
				className,
			)}
			{...props}
		>
			<ScrollAreaPrimitive.Thumb
				data-slot="scroll-area-thumb"
				className="relative flex-1 rounded-full bg-border"
			/>
		</ScrollAreaPrimitive.Scrollbar>
	);
}

export { ScrollArea, ScrollBar };
