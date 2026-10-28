import { createFileRoute } from "@tanstack/react-router";
import {
	FeeWorkspace,
	feeSearchDefaults,
	feeWorkspaceSearchSchema,
	getFeeByIdQueryOptions,
} from "@/features/fees";
import { RouteError } from "@/shared/components/route-error";
import { entityIdSchema } from "@/shared/schemas/entity";
export const Route = createFileRoute("/_app/honorarios_/$feeId")({
	staticData: { pageTitle: "Recebimento" },
	validateSearch: feeWorkspaceSearchSchema,
	loader: async ({ context: { queryClient }, params }) => {
		const { id } = entityIdSchema.parse({ id: Number(params.feeId) });
		await queryClient.query(getFeeByIdQueryOptions(id));
	},
	component: FeePage,
	errorComponent: ({ error }) => (
		<RouteError title="Recebimento" error={error} />
	),
});
function FeePage() {
	const params = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<FeeWorkspace
			key={params.feeId}
			id={Number(params.feeId)}
			search={search}
			onDeleted={() => {
				void navigate({
					to: "/honorarios",
					search: search.returnTo ?? feeSearchDefaults,
				});
			}}
			onTabChange={(tab) => {
				void navigate({
					to: "/honorarios/$feeId",
					params: { feeId: params.feeId },
					search: (previous) => ({ ...previous, tab }),
					replace: true,
				});
			}}
		/>
	);
}
