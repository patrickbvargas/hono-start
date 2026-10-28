import { createFileRoute } from "@tanstack/react-router";
import {
	EmployeeWorkspace,
	employeeSearchDefaults,
	employeeWorkspaceSearchSchema,
	getEmployeeByIdQueryOptions,
} from "@/features/employees";
import { RouteError } from "@/shared/components/route-error";
import { entityIdSchema } from "@/shared/schemas/entity";
export const Route = createFileRoute("/_app/colaboradores_/$employeeId")({
	staticData: { pageTitle: "Colaborador" },
	validateSearch: employeeWorkspaceSearchSchema,
	loader: async ({ context: { queryClient }, params }) => {
		const { id } = entityIdSchema.parse({ id: Number(params.employeeId) });
		await queryClient.query(getEmployeeByIdQueryOptions(id));
	},
	component: EmployeePage,
	errorComponent: ({ error }) => (
		<RouteError title="Colaborador" error={error} />
	),
});
function EmployeePage() {
	const params = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<EmployeeWorkspace
			key={params.employeeId}
			id={Number(params.employeeId)}
			search={search}
			onDeleted={() => {
				void navigate({
					to: "/colaboradores",
					search: search.returnTo ?? employeeSearchDefaults,
				});
			}}
			onTabChange={(tab) => {
				void navigate({
					to: "/colaboradores/$employeeId",
					params: { employeeId: params.employeeId },
					search: (previous) => ({ ...previous, tab }),
					replace: true,
				});
			}}
		/>
	);
}
