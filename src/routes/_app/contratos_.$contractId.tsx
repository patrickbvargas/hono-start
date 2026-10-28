import { createFileRoute } from "@tanstack/react-router";
import {
	ContractWorkspace,
	contractSearchDefaults,
	contractWorkspaceSearchSchema,
	getContractByIdQueryOptions,
} from "@/features/contracts";
import { RouteError } from "@/shared/components/route-error";
import { entityIdSchema } from "@/shared/schemas/entity";
export const Route = createFileRoute("/_app/contratos_/$contractId")({
	staticData: { pageTitle: "Contrato" },
	validateSearch: contractWorkspaceSearchSchema,
	loader: async ({ context: { queryClient }, params }) => {
		const { id } = entityIdSchema.parse({ id: Number(params.contractId) });
		await queryClient.query(getContractByIdQueryOptions(id));
	},
	component: ContractPage,
	errorComponent: ({ error }) => <RouteError title="Contrato" error={error} />,
});
function ContractPage() {
	const params = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<ContractWorkspace
			id={Number(params.contractId)}
			search={search}
			onDeleted={() => {
				void navigate({
					to: search.pendingReturnTo ? "/pendencias" : "/contratos",
					search:
						search.pendingReturnTo ?? search.returnTo ?? contractSearchDefaults,
				});
			}}
			onTabChange={(tab) => {
				void navigate({
					to: "/contratos/$contractId",
					params: { contractId: params.contractId },
					search: (previous) => ({ ...previous, tab }),
					replace: true,
				});
			}}
		/>
	);
}
