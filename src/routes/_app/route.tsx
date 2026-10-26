import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/features/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui";
import { ValueVisibilityProvider } from "@/shared/components/value-visibility";
import {
	LoggedUserSessionProvider,
	requireRouteSession,
} from "@/shared/session";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context: { queryClient }, location }) => {
		const session = await requireRouteSession(queryClient, location.href);

		return { session };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	return (
		<LoggedUserSessionProvider session={session}>
			<ValueVisibilityProvider>
				<SidebarProvider className="size-full">
					<AppSidebar />
					<SidebarInset>
						<Outlet />
					</SidebarInset>
				</SidebarProvider>
			</ValueVisibilityProvider>
		</LoggedUserSessionProvider>
	);
}
