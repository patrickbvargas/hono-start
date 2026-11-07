import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";
import {
	getPayableByIdQueryOptions,
	PayableWorkspace,
	payableWorkspaceSearchSchema,
} from "@/features/payables";
import { RouteError } from "@/shared/components/route-error";
import { assertCan } from "@/shared/session";
export const Route = createFileRoute("/_app/contas-a-pagar_/$payableId")({
	beforeLoad: ({ context }) => {
		assertCan(context.session, [
			"org:payables:read_all",
			"org:payables:read_own",
		]);
	},
	staticData: { pageTitle: "Título a pagar" },
	validateSearch: payableWorkspaceSearchSchema,
	loader: async ({ context: { queryClient }, params }) => {
		const id = z.coerce.number().int().positive().parse(params.payableId);
		await queryClient.query(getPayableByIdQueryOptions(id));
	},
	component: PayablePage,
	errorComponent: ({ error }) => (
		<RouteError title="Título a pagar" error={error} />
	),
});
function PayablePage() {
	const params = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<PayableWorkspace
			id={Number(params.payableId)}
			search={search}
			onTabChange={(tab) => {
				void navigate({
					search: (previous) => ({ ...previous, tab }),
					replace: true,
				});
			}}
		/>
	);
}
