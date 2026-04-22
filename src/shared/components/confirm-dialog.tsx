import { CheckIcon, XIcon } from "lucide-react";
import { AlertDialog, Button, type ButtonProps } from "@/shared/components/Hui";
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
	variant?: ButtonProps["variant"];
}

export const ConfirmDialog = ({
	state,
	onConfirm,
	description,
	isPending = false,
	title = "Confirmação",
	confirmButtonLabel = "Confirmar",
	cancelButtonLabel = "Cancelar",
	variant = "primary",
	showIcons = false,
	hideTitle = false,
}: ConfirmDialogProps) => {
	return (
		<AlertDialog isOpen={state.isOpen} onOpenChange={state.onOpenChange}>
			<AlertDialog.Backdrop>
				<AlertDialog.Container>
					<AlertDialog.Dialog>
						<AlertDialog.CloseTrigger />
						{!hideTitle && <AlertDialog.Header>{title}</AlertDialog.Header>}
						<AlertDialog.Body>
							<p>{description}</p>
						</AlertDialog.Body>
						<AlertDialog.Footer>
							<Button
								variant={variant}
								onPress={onConfirm}
								isPending={isPending}
							>
								{showIcons && <CheckIcon size={20} />}
								{confirmButtonLabel}
							</Button>
							<Button
								variant="tertiary"
								onPress={state.close}
								isPending={isPending}
							>
								{showIcons && <XIcon size={20} />}
								{cancelButtonLabel}
							</Button>
						</AlertDialog.Footer>
					</AlertDialog.Dialog>
				</AlertDialog.Container>
			</AlertDialog.Backdrop>
		</AlertDialog>
	);
};
