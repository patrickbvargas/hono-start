import { useSuspenseQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/features/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui";
import {
	getCurrentSessionQueryOptions,
	LoggedUserSessionProvider,
} from "@/shared/session";

interface AuthenticatedShellProps {
	children: React.ReactNode;
}

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
	const { data: session } = useSuspenseQuery(getCurrentSessionQueryOptions());

	return (
		<LoggedUserSessionProvider session={session}>
			<SidebarProvider className="container mx-auto h-screen max-w-7xl">
				<AppSidebar />
				<SidebarInset>{children}</SidebarInset>
			</SidebarProvider>
		</LoggedUserSessionProvider>
	);
}
