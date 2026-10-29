import { createFileRoute, redirect } from "@tanstack/react-router";
import * as z from "zod";
import {
	getLoginOrganizationCountQueryOptions,
	LoginForm,
} from "@/features/authentication";
import {
	getSafeInternalRedirectPath,
	getSessionAccessQueryOptions,
} from "@/shared/session";

const loginSearchSchema = z.object({
	redirect: z.string().optional().catch(undefined),
	selectOrganization: z.boolean().optional().catch(undefined),
});

export const Route = createFileRoute("/_auth/login")({
	staticData: { pageTitle: "Entrar" },
	validateSearch: loginSearchSchema,
	beforeLoad: async ({ context: { queryClient }, search }) => {
		const access = await queryClient.query(getSessionAccessQueryOptions());

		const organizationSelectionRequired =
			(access.status === "ready" || search.selectOrganization === true) &&
			(await queryClient.query(getLoginOrganizationCountQueryOptions())) > 1;
		if (organizationSelectionRequired) {
			return { access, organizationSelectionRequired };
		}
		if (access.status === "ready") {
			throw redirect({
				href: getSafeInternalRedirectPath(search.redirect) ?? "/",
			});
		}
		return { access, organizationSelectionRequired: false };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { redirect } = Route.useSearch();
	const { access, organizationSelectionRequired } = Route.useRouteContext();

	return (
		<LoginForm
			redirectTo={redirect}
			access={access}
			selectOrganization={organizationSelectionRequired}
		/>
	);
}
