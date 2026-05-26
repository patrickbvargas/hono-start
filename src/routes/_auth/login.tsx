import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import * as z from "zod";
import { AuthenticationScreen, LoginForm } from "@/features/authentication";
import { getPageTitle } from "@/shared/config/routes";
import {
	getAuthenticatedHomePath,
	getRouteSession,
} from "@/shared/session/route";

const loginSearchSchema = z.object({
	redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_auth/login")({
	head: () => ({
		meta: [{ title: getPageTitle("Entrar") }],
	}),
	validateSearch: zodValidator(loginSearchSchema),
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
	const { redirect } = Route.useSearch();

	return (
		<AuthenticationScreen
			title="Entrar"
			description="Use seu e-mail ou número da OAB para acessar o sistema."
			showBackToLoginLink={false}
		>
			<LoginForm redirectTo={redirect} />
		</AuthenticationScreen>
	);
}
