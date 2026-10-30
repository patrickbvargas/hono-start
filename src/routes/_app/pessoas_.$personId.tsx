import { createFileRoute } from "@tanstack/react-router";
import {
	getPersonByIdQueryOptions,
	PersonWorkspace,
	personSearchDefaults,
	personWorkspaceSearchSchema,
} from "@/features/people";
import { RouteError } from "@/shared/components/route-error";
import { entityIdSchema } from "@/shared/schemas/entity";
export const Route = createFileRoute("/_app/pessoas_/$personId")({
	staticData: { pageTitle: "Pessoa" },
	validateSearch: personWorkspaceSearchSchema,
	loader: async ({ context: { queryClient }, params }) => {
		const { id } = entityIdSchema.parse({ id: Number(params.personId) });
		await queryClient.query(getPersonByIdQueryOptions(id));
	},
	component: PersonPage,
	errorComponent: ({ error }) => <RouteError title="Pessoa" error={error} />,
});
function PersonPage() {
	const params = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<PersonWorkspace
			key={params.personId}
			id={Number(params.personId)}
			search={search}
			onDeleted={() => {
				void navigate({
					to: "/pessoas",
					search: search.returnTo ?? personSearchDefaults,
				});
			}}
			onTabChange={(tab) => {
				void navigate({
					to: "/pessoas/$personId",
					params: { personId: params.personId },
					search: (previous) => ({ ...previous, tab }),
					replace: true,
				});
			}}
		/>
	);
}
