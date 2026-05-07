import { useEffect } from "react";
import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	FieldGroup,
} from "@/shared/components/ui";
import { useChangePasswordForm } from "../../hooks/use-change-password-form";

interface ChangePasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
	open,
	onOpenChange,
}: ChangePasswordDialogProps) {
	const { form, isPending } = useChangePasswordForm({
		onSuccess: () => onOpenChange(false),
	});

	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [form, open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Alterar senha</DialogTitle>
					<DialogDescription>
						Informe sua senha atual e escolha uma nova senha para manter sua
						conta protegida.
					</DialogDescription>
				</DialogHeader>
				<form.Form form={form}>
					<DialogBody className="pb-3">
						<FieldGroup>
							<form.AppField name="currentPassword">
								{(field) => (
									<field.Input label="Senha atual" type="password" isRequired />
								)}
							</form.AppField>
						</FieldGroup>
						<FieldGroup>
							<form.AppField name="newPassword">
								{(field) => (
									<field.Input label="Nova senha" type="password" isRequired />
								)}
							</form.AppField>
						</FieldGroup>
						<FieldGroup>
							<form.AppField name="confirmPassword">
								{(field) => (
									<field.Input
										label="Confirmar nova senha"
										type="password"
										isRequired
									/>
								)}
							</form.AppField>
						</FieldGroup>
						<form.AppField name="revokeOtherSessions">
							{(field) => <field.Checkbox label="Encerrar outras sessões" />}
						</form.AppField>
					</DialogBody>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isPending}
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<form.Submit disabled={isPending}>
							{isPending ? "Salvando..." : "Salvar nova senha"}
						</form.Submit>
					</DialogFooter>
				</form.Form>
			</DialogContent>
		</Dialog>
	);
}
