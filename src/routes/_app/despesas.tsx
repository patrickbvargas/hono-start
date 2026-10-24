import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	ExpenseDelete,
	ExpenseDetails,
	ExpenseFilter,
	ExpenseForm,
	ExpenseList,
	ExpenseRestore,
	ExpenseTable,
	expenseSearchDefaults,
	expenseSearchSchema,
	getExpenseCategoriesQueryOptions,
	getExpensesQueryOptions,
	useExpenses,
} from "@/features/expenses";
import { ButtonNew } from "@/shared/components/button-new";
import { EntityView } from "@/shared/components/entity-view";
import { RouteError } from "@/shared/components/route-error";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { getPageTitle, ROUTES } from "@/shared/config/routes";
import { useEntityOverlay } from "@/shared/hooks/use-entity-overlay";
import { formatter } from "@/shared/lib/formatter";
import { entityDetailSearchSchema } from "@/shared/schemas/entity-detail-search";
import { hasPermission, useLoggedUserSession } from "@/shared/session";

export const Route = createFileRoute("/_app/despesas")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.expense.title) }],
	}),
	validateSearch: expenseSearchSchema.extend(entityDetailSearchSchema.shape),
	search: {
		middlewares: [stripSearchParams(expenseSearchDefaults)],
	},
	loaderDeps: ({ search: { detailId: _detailId, ...search } }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.query(getExpensesQueryOptions(search)),
			queryClient.query(getExpenseCategoriesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.expense.title} error={error} />
	),
});

function RouteComponent() {
	const { detailId, ...search } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { expenses } = useExpenses(search);
	const { overlay } = useEntityOverlay(detailId, (id) => {
		void navigate({
			search: (previous) => ({ ...previous, detailId: id }),
			replace: id === undefined,
		});
	});
	const session = useLoggedUserSession();
	const isAdmin =
		hasPermission(session, "org:expenses:delete") ||
		hasPermission(session, "org:expenses:restore");

	return (
		<Wrapper
			title={ROUTES.expense.title}
			actions={
				<ButtonNew
					permission="org:expenses:create"
					label="Nova despesa"
					onClick={() => overlay.create.open()}
				/>
			}
		>
			<WrapperHeader className="flex-wrap md:flex-nowrap">
				<ExpenseFilter
					summary={
						<p className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
							Total filtrado:{" "}
							<strong className="font-semibold tabular-nums text-foreground">
								{formatter.currency(expenses.totalAmount)}
							</strong>
						</p>
					}
				/>
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					list={
						<ExpenseList
							data={expenses}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
					table={
						<ExpenseTable
							data={expenses}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
				/>
				{overlay.create.render((state) => (
					<ExpenseForm state={state} onSuccess={state.close} />
				))}
				{overlay.edit.render((id, state) => (
					<ExpenseForm id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.delete.render((id, state) => (
					<ExpenseDelete id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.restore.render((id, state) => (
					<ExpenseRestore id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.details.render((id, state) => (
					<ExpenseDetails
						id={id}
						state={state}
						onEdit={overlay.edit.open}
						onDelete={overlay.delete.open}
						onRestore={overlay.restore.open}
						canManageLifecycle={isAdmin}
					/>
				))}
			</WrapperBody>
		</Wrapper>
	);
}
