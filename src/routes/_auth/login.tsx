import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import * as z from "zod";
import { AuthenticationScreen, LoginForm } from "@/features/authentication";
import { getRouteSession } from "@/shared/session";

const loginSearchSchema = z.object({
	redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_auth/login")({
	validateSearch: zodValidator(loginSearchSchema),
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
	const { redirect } = Route.useSearch();

	return (
		<AuthenticationScreen
			title="Entrar na plataforma"
			description="Use seu email ou número da OAB para acessar os módulos protegidos do sistema."
			showBackToLoginLink={false}
		>
			<LoginForm redirectTo={redirect} />
		</AuthenticationScreen>
	);
}
