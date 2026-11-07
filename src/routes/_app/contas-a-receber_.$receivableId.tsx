import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";
import {
	getReceivableByIdQueryOptions,
	ReceivableWorkspace,
	receivableWorkspaceSearchSchema,
} from "@/features/receivables";
import { RouteError } from "@/shared/components/route-error";
import { assertCan } from "@/shared/session";
export const Route = createFileRoute("/_app/contas-a-receber_/$receivableId")({
	beforeLoad: ({ context }) => {
		assertCan(context.session, [
			"org:receivables:read_all",
			"org:receivables:read_assigned",
		]);
	},
	staticData: { pageTitle: "Título a receber" },
	validateSearch: receivableWorkspaceSearchSchema,
	loader: async ({ context: { queryClient }, params }) => {
		const id = z.coerce.number().int().positive().parse(params.receivableId);
		await queryClient.query(getReceivableByIdQueryOptions(id));
	},
	component: ReceivablePage,
	errorComponent: ({ error }) => (
		<RouteError title="Título a receber" error={error} />
	),
});
function ReceivablePage() {
	const params = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<ReceivableWorkspace
			id={Number(params.receivableId)}
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
