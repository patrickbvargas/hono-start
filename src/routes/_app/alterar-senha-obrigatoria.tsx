import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	AuthenticationScreen,
	ForcedChangePasswordForm,
} from "@/features/authentication";
import { getPageTitle } from "@/shared/config/routes";

export const Route = createFileRoute("/_app/alterar-senha-obrigatoria")({
	head: () => ({
		meta: [{ title: getPageTitle("Alterar senha") }],
	}),
	beforeLoad: async ({ context: { session } }) => {
		if (!session.mustChangePassword) {
			throw redirect({
				to: "/",
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-full items-center justify-center p-6">
			<AuthenticationScreen
				title="Alterar senha"
				description="Sua conta recebeu uma senha temporária. Escolha uma nova senha para continuar."
				showBackToLoginLink={false}
				footer={null}
			>
				<ForcedChangePasswordForm />
			</AuthenticationScreen>
		</div>
	);
}
