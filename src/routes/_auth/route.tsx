import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RouteError } from "@/shared/components/route-error";

export const Route = createFileRoute("/_auth")({
	errorComponent: ({ error }) => <RouteError error={error} />,
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-full w-full items-center justify-center px-4">
			<Outlet />
		</div>
	);
}
