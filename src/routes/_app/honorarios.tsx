import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_app/honorarios")({
	beforeLoad: () => {
		throw redirect({ href: "/contas-a-receber" });
	},
});
