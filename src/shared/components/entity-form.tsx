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
} from "@/shared/components/ui";
import { formContext } from "@/shared/hooks/use-app-form";
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
	const [dirty, submitting] = useStore(form.store, (state) => [
		state.isDirty,
		state.isSubmitting,
	]);
	return <EntityFormContent {...props} dirty={dirty} submitting={submitting} />;
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
	...props
}: EntityFormProps & { dirty?: boolean; submitting?: boolean }) => {
	const [confirmDiscard, setConfirmDiscard] = React.useState(false);
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
					className={cn(
						"flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-lg",
						contentClassName,
					)}
				>
					<DialogHeader className="shrink-0 pr-8">
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
					<DialogBody
						className={cn(
							"flex min-h-0 flex-1 flex-col gap-5 -mx-4 no-scrollbar max-h-[80dvh] overflow-y-auto px-4 py-2",
							bodyClassName,
						)}
					>
						{children}
					</DialogBody>
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
