import { Link } from "@tanstack/react-router";
import { FieldGroup } from "@/shared/components/ui";
import { useLoginForm } from "../../hooks/use-login-form";

export function LoginForm() {
	const { form, isPending } = useLoginForm();

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
				<FieldGroup>
					<form.AppField name="password">
						{(field) => (
							<field.Input label="Senha" type="password" isRequired />
						)}
					</form.AppField>
				</FieldGroup>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<form.AppField name="rememberMe">
						{(field) => <field.Checkbox label="Manter conectado por 7 dias" />}
					</form.AppField>
					<Link
						to="/recuperar-senha"
						className="text-sm font-medium text-foreground underline underline-offset-4"
					>
						Esqueci minha senha
					</Link>
				</div>
				<form.Submit disabled={isPending} className="w-full">
					{isPending ? "Entrando..." : "Entrar"}
				</form.Submit>
			</div>
		</form.Form>
	);
}
