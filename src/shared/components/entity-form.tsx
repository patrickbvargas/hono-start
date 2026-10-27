import { type AnyFormApi, useStore } from "@tanstack/react-form-start";
import * as React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	ScrollArea,
} from "@/shared/components/ui";
import { formContext } from "@/shared/hooks/use-app-form";
import { useFormValidationFocus } from "@/shared/hooks/use-form-validation-focus";
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

export const EntityForm = ({ ...props }: EntityFormProps) => {
	const form = React.useContext(formContext);
	if (!form) {
		return <EntityFormContent {...props} />;
	}
	return <ConnectedEntityForm {...props} form={form} />;
};

function ConnectedEntityForm({
	form,
	...props
}: EntityFormProps & { form: AnyFormApi }) {
	const [dirty, submitting, attempts, valid, validating] = useStore(
		form.store,
		(state) => [
			state.isDirty,
			state.isSubmitting,
			state.submissionAttempts,
			state.isValid,
			state.isValidating,
		],
	);
	return (
		<EntityFormContent
			{...props}
			dirty={dirty}
			submitting={submitting}
			attempts={attempts}
			valid={valid}
			validating={validating}
		/>
	);
}

const EntityFormContent = ({
	title,
	state,
	footer,
	children,
	contentClassName,
	bodyClassName,
	dirty = false,
	submitting = false,
	attempts = 0,
	valid = true,
	validating = false,
	...props
}: EntityFormProps & {
	dirty?: boolean;
	submitting?: boolean;
	attempts?: number;
	valid?: boolean;
	validating?: boolean;
}) => {
	const [confirmDiscard, setConfirmDiscard] = React.useState(false);
	const contentRef = useFormValidationFocus({
		attempts,
		valid,
		submitting,
		validating,
		isOpen: state.isOpen,
	});
	return (
		<>
			<Dialog
				{...props}
				open={state.isOpen}
				onOpenChange={(open) => {
					if (!open && submitting) {
						return;
					}
					if (!open && dirty) {
						setConfirmDiscard(true);
						return;
					}
					state.onOpenChange(open);
				}}
			>
				<DialogContent
					ref={contentRef}
					className={cn(
						"flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-lg",
						contentClassName,
					)}
				>
					<DialogHeader className="shrink-0 pr-8">
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
					<ScrollArea className="min-h-0 flex-1 max-h-[80dvh] -mx-4 [&>[data-slot=scroll-area-viewport]]:max-h-[80dvh]">
						<DialogBody
							className={cn("flex flex-col gap-5 px-4 py-2", bodyClassName)}
						>
							{attempts > 0 && !valid ? (
								<p
									role="alert"
									className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
								>
									Revise os campos indicados antes de salvar.
								</p>
							) : null}
							{children}
						</DialogBody>
					</ScrollArea>
					{footer && <DialogFooter className="shrink-0">{footer}</DialogFooter>}
				</DialogContent>
			</Dialog>
			<AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
						<AlertDialogDescription>
							As alterações não salvas serão perdidas.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Continuar editando</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setConfirmDiscard(false);
								state.close();
							}}
						>
							Descartar alterações
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
