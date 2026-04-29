import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import * as z from "zod";
import {
	AuthenticationScreen,
	PasswordResetCompleteForm,
	PasswordResetRequestForm,
} from "@/features/authentication";
import { getRouteSession } from "@/shared/session";

const passwordResetSearchSchema = z.object({
	token: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_auth/recuperar-senha")({
	validateSearch: zodValidator(passwordResetSearchSchema),
	beforeLoad: async ({ context: { queryClient } }) => {
		const session = await getRouteSession(queryClient);

		if (session) {
			throw redirect({
				to: "/",
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { token } = Route.useSearch();
	const isCompletingReset = !!token;

	return (
		<AuthenticationScreen
			title={isCompletingReset ? "Definir nova senha" : "Recuperar acesso"}
			description={
				isCompletingReset
					? "Escolha uma nova senha para voltar a acessar a plataforma."
					: "Informe seu email ou número da OAB. Se a conta existir, enviaremos um link seguro de redefinição."
			}
			footer={null}
		>
			{isCompletingReset && token ? (
				<PasswordResetCompleteForm token={token} />
			) : (
				<PasswordResetRequestForm />
			)}
		</AuthenticationScreen>
	);
}
