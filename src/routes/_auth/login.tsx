import { createFileRoute, redirect } from "@tanstack/react-router";
import * as z from "zod";
import { LoginForm } from "@/features/authentication";
import {
	getSafeInternalRedirectPath,
	getSessionAccessQueryOptions,
} from "@/shared/session";

const loginSearchSchema = z.object({
	redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_auth/login")({
	staticData: { pageTitle: "Entrar" },
	validateSearch: loginSearchSchema,
	beforeLoad: async ({ context: { queryClient }, search }) => {
		const access = await queryClient.query(getSessionAccessQueryOptions());

		if (access.status === "ready") {
			throw redirect({
				href: getSafeInternalRedirectPath(search.redirect) ?? "/",
			});
		}
		return { access };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { redirect } = Route.useSearch();
	const { access } = Route.useRouteContext();

	return <LoginForm redirectTo={redirect} access={access} />;
}
