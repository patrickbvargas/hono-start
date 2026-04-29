import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/features/app-sidebar";
import { RouteError } from "@/shared/components/route-error";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui";
import {
	LoggedUserSessionProvider,
	requireRouteSession,
} from "@/shared/session";

export const Route = createFileRoute("/_app")({
	loader: async ({ context: { queryClient } }) => {
		return requireRouteSession(queryClient);
	},
	errorComponent: ({ error }) => <RouteError error={error} />,
	component: RouteComponent,
});

function RouteComponent() {
	const session = Route.useLoaderData();

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
