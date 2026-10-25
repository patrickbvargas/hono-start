import { createFileRoute } from "@tanstack/react-router";
import {
	ExpenseWorkspace,
	expenseSearchDefaults,
	expenseWorkspaceSearchSchema,
	getExpenseByIdQueryOptions,
} from "@/features/expenses";
import { RouteError } from "@/shared/components/route-error";
import { getPageTitle } from "@/shared/config/routes";
import { entityIdSchema } from "@/shared/schemas/entity";
export const Route = createFileRoute("/_app/despesas_/$expenseId")({
	head: () => ({ meta: [{ title: getPageTitle("Despesa") }] }),
	validateSearch: expenseWorkspaceSearchSchema,
	loader: async ({ context: { queryClient }, params }) => {
		const { id } = entityIdSchema.parse({ id: Number(params.expenseId) });
		await queryClient.query(getExpenseByIdQueryOptions(id));
	},
	component: ExpensePage,
	errorComponent: ({ error }) => <RouteError title="Despesa" error={error} />,
});
function ExpensePage() {
	const params = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<ExpenseWorkspace
			key={params.expenseId}
			id={Number(params.expenseId)}
			search={search}
			onDeleted={() => {
				void navigate({
					to: "/despesas",
					search: search.returnTo ?? expenseSearchDefaults,
				});
			}}
			onTabChange={(tab) => {
				void navigate({
					to: "/despesas/$expenseId",
					params: { expenseId: params.expenseId },
					search: (previous) => ({ ...previous, tab }),
					replace: true,
				});
			}}
		/>
	);
}
