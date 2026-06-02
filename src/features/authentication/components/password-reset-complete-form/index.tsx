import { FieldGroup } from "@/shared/components/ui";
import { usePasswordResetCompleteForm } from "../../hooks/use-password-reset-complete-form";

interface PasswordResetCompleteFormProps {
	code: string;
}

export function PasswordResetCompleteForm({
	code,
}: PasswordResetCompleteFormProps) {
	const { form, isPending } = usePasswordResetCompleteForm(code);

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
				<form.Submit disabled={isPending} className="w-full">
					{isPending ? "Redefinindo..." : "Redefinir senha"}
				</form.Submit>
			</div>
		</form.Form>
	);
}
