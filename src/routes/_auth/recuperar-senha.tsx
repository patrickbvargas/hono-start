import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/recuperar-senha")({
	beforeLoad: () => {
		throw redirect({ to: "/login" });
	},
});
