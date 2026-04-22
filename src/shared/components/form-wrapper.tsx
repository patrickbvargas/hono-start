import type * as React from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";

interface FormWrapperProps
	extends Omit<React.ComponentProps<typeof Dialog>, "children"> {
	title: string;
	state: OverlayState;
	footer?: React.ReactNode;
	children: React.ReactNode;
}

export const FormWrapper = ({
	title,
	state,
	footer,
	children,
	...props
}: FormWrapperProps) => {
	return (
		<Dialog open={state.isOpen} onOpenChange={state.onOpenChange} {...props}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<DialogBody className="flex flex-col gap-2.5 overflow-hidden">
					{children}
				</DialogBody>
				{footer && <DialogFooter>{footer}</DialogFooter>}
			</DialogContent>
		</Dialog>
	);
};
