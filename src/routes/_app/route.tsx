import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/features/app-sidebar";
import { RouteError } from "@/shared/components/route-error";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui";
import {
	getCurrentSessionQueryOptions,
	LoggedUserSessionProvider,
	requireRouteSession,
} from "@/shared/session";

export const Route = createFileRoute("/_app")({
	loader: async ({ context: { queryClient } }) => {
		await requireRouteSession(queryClient);
	},
	errorComponent: ({ error }) => <RouteError error={error} />,
	component: RouteComponent,
});

function RouteComponent() {
	const { data: session } = useSuspenseQuery(getCurrentSessionQueryOptions());

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
