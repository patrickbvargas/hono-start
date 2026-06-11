import { FieldGroup } from "@/shared/components/ui";
import { usePasswordResetRequestForm } from "../../hooks/use-password-reset-request-form";

export function PasswordResetRequestForm() {
	const { form, isPending } = usePasswordResetRequestForm();

	return (
		<form.Form form={form}>
			<div className="space-y-5">
				<FieldGroup>
					<form.AppField name="identifier">
						{(field) => (
							<field.Input
								label="E-mail ou OAB"
								placeholder="nome@firma.com.br ou RS123456"
								isRequired
							/>
						)}
					</form.AppField>
				</FieldGroup>
				<form.Submit isLoading={isPending} className="w-full">
					Enviar link de redefinição
				</form.Submit>
			</div>
		</form.Form>
	);
}
