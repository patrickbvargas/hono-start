import { Dialog as DrawerPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/shared/lib/utils";

type DrawerDirection = "top" | "right" | "bottom" | "left";

interface DrawerContentProps extends DrawerPrimitive.Popup.Props {
	container?: DrawerPrimitive.Portal.Props["container"];
	direction?: DrawerDirection;
}

function Drawer({ ...props }: DrawerPrimitive.Root.Props) {
	return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
	return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
	return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
	className,
	...props
}: DrawerPrimitive.Backdrop.Props) {
	return (
		<DrawerPrimitive.Backdrop
			data-slot="drawer-overlay"
			className={cn(
				"absolute inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
				className,
			)}
			{...props}
		/>
	);
}

function DrawerContent({
	className,
	children,
	container,
	direction = "bottom",
	...props
}: DrawerContentProps) {
	return (
		<DrawerPortal container={container}>
			<DrawerOverlay />
			<DrawerPrimitive.Popup
				data-slot="drawer-content"
				data-direction={direction}
				className={cn(
					"group/drawer-content absolute z-50 flex h-auto flex-col bg-popover text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-[direction=bottom]:inset-x-0 data-[direction=bottom]:bottom-0 data-[direction=bottom]:mt-24 data-[direction=bottom]:max-h-[80vh] data-[direction=bottom]:rounded-t-xl data-[direction=bottom]:border-t data-[direction=left]:inset-y-0 data-[direction=left]:left-0 data-[direction=left]:h-full data-[direction=left]:w-3/4 data-[direction=left]:rounded-r-xl data-[direction=left]:border-r data-[direction=right]:inset-y-0 data-[direction=right]:right-0 data-[direction=right]:h-full data-[direction=right]:w-3/4 data-[direction=right]:rounded-l-xl data-[direction=right]:border-l data-[direction=top]:inset-x-0 data-[direction=top]:top-0 data-[direction=top]:mb-24 data-[direction=top]:max-h-[80vh] data-[direction=top]:rounded-b-xl data-[direction=top]:border-b data-[direction=left]:sm:max-w-sm data-[direction=right]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-[direction=bottom]:data-open:slide-in-from-bottom-10 data-[direction=left]:data-open:slide-in-from-left-10 data-[direction=right]:data-open:slide-in-from-right-10 data-[direction=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[direction=bottom]:data-closed:slide-out-to-bottom-10 data-[direction=left]:data-closed:slide-out-to-left-10 data-[direction=right]:data-closed:slide-out-to-right-10 data-[direction=top]:data-closed:slide-out-to-top-10",
					className,
				)}
				{...props}
			>
				<div className="mx-auto mt-4 hidden h-1 w-25 shrink-0 rounded-full bg-muted group-data-[direction=bottom]/drawer-content:block" />
				{children}
			</DrawerPrimitive.Popup>
		</DrawerPortal>
	);
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-header"
			className={cn(
				"flex flex-col gap-0.5 p-4 group-data-[direction=bottom]/drawer-content:text-center group-data-[direction=top]/drawer-content:text-center md:gap-0.5 md:text-left",
				className,
			)}
			{...props}
		/>
	);
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-footer"
			className={cn("mt-auto flex flex-col gap-2 p-4", className)}
			{...props}
		/>
	);
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
	return (
		<DrawerPrimitive.Title
			data-slot="drawer-title"
			className={cn(
				"font-heading text-base font-medium text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function DrawerDescription({
	className,
	...props
}: DrawerPrimitive.Description.Props) {
	return (
		<DrawerPrimitive.Description
			data-slot="drawer-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerPortal,
	DrawerTitle,
	DrawerTrigger,
};
