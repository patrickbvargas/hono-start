import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-full w-full items-center justify-center px-4">
			<Outlet />
		</div>
	);
}
