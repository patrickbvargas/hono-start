import { createFileRoute } from "@tanstack/react-router";
import {
	ClientWorkspace,
	clientSearchDefaults,
	clientWorkspaceSearchSchema,
	getClientByIdQueryOptions,
} from "@/features/clients";
import { RouteError } from "@/shared/components/route-error";
import { entityIdSchema } from "@/shared/schemas/entity";
export const Route = createFileRoute("/_app/clientes_/$clientId")({
	staticData: { pageTitle: "Cliente" },
	validateSearch: clientWorkspaceSearchSchema,
	loader: async ({ context: { queryClient }, params }) => {
		const { id } = entityIdSchema.parse({ id: Number(params.clientId) });
		await queryClient.query(getClientByIdQueryOptions(id));
	},
	component: ClientPage,
	errorComponent: ({ error }) => <RouteError title="Cliente" error={error} />,
});
function ClientPage() {
	const params = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<ClientWorkspace
			key={params.clientId}
			id={Number(params.clientId)}
			search={search}
			onDeleted={() => {
				void navigate({
					to: "/clientes",
					search: search.returnTo ?? clientSearchDefaults,
				});
			}}
			onTabChange={(tab) => {
				void navigate({
					to: "/clientes/$clientId",
					params: { clientId: params.clientId },
					search: (previous) => ({ ...previous, tab }),
					replace: true,
				});
			}}
		/>
	);
}
