import type { VariantProps } from "class-variance-authority";
import { CheckIcon, XIcon } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	type buttonVariants,
} from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";

export interface ConfirmDialogProps {
	state: OverlayState;
	onConfirm: () => void;
	title?: string;
	description: string;
	isPending?: boolean;
	hideTitle?: boolean;
	showIcons?: boolean;
	confirmButtonLabel?: string;
	cancelButtonLabel?: string;
	variant?: VariantProps<typeof buttonVariants>["variant"];
}

export const ConfirmDialog = ({
	state,
	onConfirm,
	description,
	isPending = false,
	title = "Confirmação",
	confirmButtonLabel = "Confirmar",
	cancelButtonLabel = "Cancelar",
	variant = "default",
	showIcons = false,
	hideTitle = false,
}: ConfirmDialogProps) => {
	return (
		<AlertDialog open={state.isOpen} onOpenChange={state.onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					{!hideTitle && <AlertDialogTitle>{title}</AlertDialogTitle>}
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>
						{showIcons && <XIcon size={20} />}
						{cancelButtonLabel}
					</AlertDialogCancel>
					<AlertDialogAction
						variant={variant}
						onClick={onConfirm}
						disabled={isPending}
					>
						{showIcons && <CheckIcon size={20} />}
						{confirmButtonLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
