import { FieldGroup } from "@/shared/components/ui";
import { useForcedChangePasswordForm } from "../../hooks/use-forced-change-password-form";

export function ForcedChangePasswordForm() {
	const { form, isPending } = useForcedChangePasswordForm();

	return (
		<form.Form form={form}>
			<div className="space-y-5">
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
				<form.Submit disabled={isPending} className="w-full">
					{isPending ? "Salvando..." : "Salvar nova senha"}
				</form.Submit>
			</div>
		</form.Form>
	);
}
