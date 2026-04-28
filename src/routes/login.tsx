import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthPanel, LoginForm } from "@/features/authentication";
import { getRouteSession } from "@/shared/session";

export const Route = createFileRoute("/login")({
	loader: async ({ context: { queryClient } }) => {
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
	return (
		<AuthPanel
			eyebrow="Acesso seguro"
			title="Entrar na plataforma"
			description="Use seu email ou número da OAB para acessar os módulos protegidos do sistema."
			footer={null}
		>
			<LoginForm />
		</AuthPanel>
	);
}
