import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import type * as React from "react";
import { cn } from "@/shared/lib/utils";
import { DropdownMenuItem } from "./dropdown-menu";
import { MENU_POPUP_CLASS_NAME } from "./menu-styles";

function ContextMenu(props: ContextMenuPrimitive.Root.Props) {
	return <ContextMenuPrimitive.Root {...props} />;
}

function ContextMenuTrigger(props: ContextMenuPrimitive.Trigger.Props) {
	return (
		<ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
	);
}

function ContextMenuContent({
	className,
	...props
}: ContextMenuPrimitive.Popup.Props) {
	return (
		<ContextMenuPrimitive.Portal>
			<ContextMenuPrimitive.Positioner className="isolate z-50 outline-none">
				<ContextMenuPrimitive.Popup
					data-slot="context-menu-content"
					className={cn(MENU_POPUP_CLASS_NAME, "w-auto min-w-40", className)}
					{...props}
				/>
			</ContextMenuPrimitive.Positioner>
		</ContextMenuPrimitive.Portal>
	);
}

function ContextMenuItem(props: React.ComponentProps<typeof DropdownMenuItem>) {
	return <DropdownMenuItem data-slot="context-menu-item" {...props} />;
}

export { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger };
