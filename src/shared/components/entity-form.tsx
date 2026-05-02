import type * as React from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { OverlayState } from "@/shared/types/overlay";

interface EntityFormProps
	extends Omit<React.ComponentProps<typeof Dialog>, "children"> {
	title: string;
	state: OverlayState;
	footer?: React.ReactNode;
	children: React.ReactNode;
	contentClassName?: string;
	bodyClassName?: string;
}

export const EntityForm = ({
	title,
	state,
	footer,
	children,
	contentClassName,
	bodyClassName,
	...props
}: EntityFormProps) => {
	return (
		<Dialog open={state.isOpen} onOpenChange={state.onOpenChange} {...props}>
			<DialogContent className={cn("sm:max-w-lg", contentClassName)}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<DialogBody
					className={cn("flex flex-col gap-5", bodyClassName)}
				>
					{children}
				</DialogBody>
				{footer && <DialogFooter>{footer}</DialogFooter>}
			</DialogContent>
		</Dialog>
	);
};
