import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/features/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui";
import {
	FORCED_PASSWORD_CHANGE_PATH,
	LoggedUserSessionProvider,
	requireRouteSession,
} from "@/shared/session";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context: { queryClient }, location }) => {
		const session = await requireRouteSession(queryClient, location.href);

		if (
			session.mustChangePassword &&
			location.pathname !== FORCED_PASSWORD_CHANGE_PATH
		) {
			throw redirect({
				to: FORCED_PASSWORD_CHANGE_PATH,
			});
		}

		return { session };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	return (
		<LoggedUserSessionProvider session={session}>
			<SidebarProvider className="h-full w-full">
				<AppSidebar />
				<SidebarInset>
					<Outlet />
				</SidebarInset>
			</SidebarProvider>
		</LoggedUserSessionProvider>
	);
}
