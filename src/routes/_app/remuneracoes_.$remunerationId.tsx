import { createFileRoute } from "@tanstack/react-router";
import {
	getRemunerationByIdQueryOptions,
	RemunerationWorkspace,
	remunerationSearchDefaults,
	remunerationWorkspaceSearchSchema,
} from "@/features/remunerations";
import { RouteError } from "@/shared/components/route-error";
import { entityIdSchema } from "@/shared/schemas/entity";
export const Route = createFileRoute("/_app/remuneracoes_/$remunerationId")({
	staticData: { pageTitle: "Remuneração" },
	validateSearch: remunerationWorkspaceSearchSchema,
	loader: async ({ context: { queryClient }, params }) => {
		const { id } = entityIdSchema.parse({ id: Number(params.remunerationId) });
		await queryClient.query(getRemunerationByIdQueryOptions(id));
	},
	component: RemunerationPage,
	errorComponent: ({ error }) => (
		<RouteError title="Remuneração" error={error} />
	),
});
function RemunerationPage() {
	const params = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<RemunerationWorkspace
			key={params.remunerationId}
			id={Number(params.remunerationId)}
			search={search}
			onDeleted={() => {
				void navigate({
					to: "/remuneracoes",
					search: search.returnTo ?? remunerationSearchDefaults,
				});
			}}
			onTabChange={(tab) => {
				void navigate({
					to: "/remuneracoes/$remunerationId",
					params: { remunerationId: params.remunerationId },
					search: (previous) => ({ ...previous, tab }),
					replace: true,
				});
			}}
		/>
	);
}
