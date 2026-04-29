import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthenticationScreen, LoginForm } from "@/features/authentication";
import { RouteError } from "@/shared/components/route-error";
import { getRouteSession } from "@/shared/session";

export const Route = createFileRoute("/_auth/login")({
	loader: async ({ context: { queryClient } }) => {
		const session = await getRouteSession(queryClient);

		if (session) {
			throw redirect({
				to: "/",
			});
		}
	},
	errorComponent: ({ error }) => <RouteError error={error} />,
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<AuthenticationScreen
			title="Entrar na plataforma"
			description="Use seu email ou número da OAB para acessar os módulos protegidos do sistema."
			showBackToLoginLink={false}
		>
			<LoginForm />
		</AuthenticationScreen>
	);
}
