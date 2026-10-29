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
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	ScrollArea,
	Skeleton,
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
	footerStart?: React.ReactNode;
	isLoading?: boolean;
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
	footerStart,
	isLoading = false,
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
	const requestClose = () => {
		if (submitting) {
			return;
		}
		if (dirty) {
			setConfirmDiscard(true);
			return;
		}
		state.onOpenChange(false);
	};
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
					if (!open) {
						requestClose();
						return;
					}
					state.onOpenChange(open);
				}}
			>
				<DialogContent
					ref={contentRef}
					className={cn(
						"flex h-dvh max-h-dvh max-w-full rounded-none sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl flex-col gap-0 overflow-hidden p-0 shadow-xl sm:max-w-2xl",
						contentClassName,
					)}
				>
					<DialogHeader className="shrink-0 gap-1.5 border-b bg-muted/30 px-5 py-4 pr-12">
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
					<ScrollArea className="min-h-0 flex-1 sm:max-h-[calc(100dvh-13rem)] sm:[&>[data-slot=scroll-area-viewport]]:max-h-[calc(100dvh-13rem)]">
						<DialogBody
							className={cn(
								"flex flex-col gap-3 p-4 sm:p-5 [&>[data-slot=form-section]~[data-slot=form-section]]:border-t [&>[data-slot=form-section]~[data-slot=form-section]]:pt-3",
								bodyClassName,
							)}
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
					{footer && (
						<DialogFooter className="m-0 shrink-0 flex-col rounded-none px-5 py-3 sm:flex-row sm:items-center">
							{footerStart && (
								<div className="min-w-0 sm:mr-auto">{footerStart}</div>
							)}
							<div className="flex items-center justify-end gap-2">
								{isLoading ? (
									<Skeleton className="h-8 w-20 rounded-lg" />
								) : (
									<Button
										type="button"
										variant="outline"
										disabled={submitting}
										onClick={requestClose}
									>
										Cancelar
									</Button>
								)}
								{footer}
							</div>
						</DialogFooter>
					)}
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
