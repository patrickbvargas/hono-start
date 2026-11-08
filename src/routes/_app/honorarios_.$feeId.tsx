import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_app/honorarios_/$feeId")({
	beforeLoad: () => {
		throw redirect({ href: "/contas-a-receber" });
	},
});
