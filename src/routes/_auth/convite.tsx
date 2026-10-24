import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticationScreen,
	InvitationSetup,
} from "@/features/authentication";

export const Route = createFileRoute("/_auth/convite")({
	component: () => (
		<AuthenticationScreen
			title="Concluir acesso"
			description="Aceite o convite para acessar o sistema."
			showBackToLoginLink={false}
		>
			<InvitationSetup />
		</AuthenticationScreen>
	),
});
