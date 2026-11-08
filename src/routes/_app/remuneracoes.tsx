import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_app/remuneracoes")({
	beforeLoad: () => {
		throw redirect({ href: "/contas-a-pagar" });
	},
});
