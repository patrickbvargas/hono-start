import { createFileRoute, redirect } from "@tanstack/react-router";
import * as z from "zod";
import { LoginForm } from "@/features/authentication";
import { getPageTitle } from "@/shared/config/routes";
import { getRouteSession } from "@/shared/session/client";

const loginSearchSchema = z.object({
	redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_auth/login")({
	head: () => ({
		meta: [{ title: getPageTitle("Entrar") }],
	}),
	validateSearch: loginSearchSchema,
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

	return <LoginForm redirectTo={redirect} />;
}
