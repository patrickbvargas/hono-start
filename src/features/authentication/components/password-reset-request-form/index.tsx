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
								label="Email ou OAB"
								placeholder="nome@firma.com.br ou RS123456"
								isRequired
							/>
						)}
					</form.AppField>
				</FieldGroup>
				<form.Submit disabled={isPending} className="w-full">
					{isPending ? "Enviando..." : "Enviar link de redefinição"}
				</form.Submit>
			</div>
		</form.Form>
	);
}
