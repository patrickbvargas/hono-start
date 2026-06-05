import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import * as React from "react";
import * as z from "zod";
import {
	AuthenticationScreen,
	PasswordResetCompleteForm,
	PasswordResetRequestForm,
} from "@/features/authentication";
import { getPageTitle } from "@/shared/config/routes";
import {
	getAuthenticatedHomePath,
	getRouteSession,
} from "@/shared/session/route";

const passwordResetSearchSchema = z.object({
	code: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_auth/recuperar-senha")({
	head: () => ({
		meta: [{ title: getPageTitle("Recuperar acesso") }],
	}),
	validateSearch: zodValidator(passwordResetSearchSchema),
	beforeLoad: async ({ context: { queryClient } }) => {
		const session = await getRouteSession(queryClient);

		if (session) {
			throw redirect({
				to: getAuthenticatedHomePath(session),
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { code } = Route.useSearch();
	const isCompletingReset = !!code;

	React.useEffect(() => {
		document.title = getPageTitle(
			isCompletingReset ? "Redefinir senha" : "Recuperar acesso",
		);
	}, [isCompletingReset]);

	return (
		<AuthenticationScreen
			title={isCompletingReset ? "Redefinir senha" : "Recuperar acesso"}
			description={
				isCompletingReset
					? "Escolha uma nova senha para voltar a acessar a plataforma."
					: "Informe seu email ou número da OAB. Se a conta existir, enviaremos um link seguro de redefinição."
			}
			footer={null}
		>
			{isCompletingReset && code ? (
				<PasswordResetCompleteForm code={code} />
			) : (
				<PasswordResetRequestForm />
			)}
		</AuthenticationScreen>
	);
}
