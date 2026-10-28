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
	useExpenseFilter,
	useExpenses,
} from "@/features/expenses";
import { ButtonNew } from "@/shared/components/button-new";
import { EntityView } from "@/shared/components/entity-view";
import { RouteError } from "@/shared/components/route-error";
import { ListEmptyState } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useEntityOverlay } from "@/shared/hooks/use-entity-overlay";
import { formatter } from "@/shared/lib/formatter";
import { entityDetailSearchSchema } from "@/shared/schemas/entity-detail-search";
import { hasPermission, useLoggedUserSession } from "@/shared/session";

export const Route = createFileRoute("/_app/despesas")({
	staticData: { pageTitle: ROUTES.expense.title },
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
	const filterController = useExpenseFilter();
	const { detailId, ...search } = Route.useSearch();
	const navigate = Route.useNavigate();
	const openExpensePage = (id: number) => {
		void navigate({
			to: "/despesas/$expenseId",
			params: { expenseId: String(id) },
			search: { tab: "overview", returnTo: search },
		});
	};
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

	const emptyState = (
		<ListEmptyState
			title="Nenhuma despesa disponível"
			description="As despesas registradas aparecerão aqui."
			hasFilters={filterController.canClearFilters}
			onClearFilters={filterController.handleClearFilters}
			hasRecords={expenses.total > 0}
			onFirstPage={() =>
				void navigate({ search: (previous) => ({ ...previous, page: 1 }) })
			}
			createAction={
				hasPermission(session, "org:expenses:create") ? (
					<ButtonNew
						permission="org:expenses:create"
						label="Nova despesa"
						onClick={() => overlay.create.open()}
					/>
				) : null
			}
		/>
	);

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
					controller={filterController}
					summary={
						<p className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
							Total filtrado:{" "}
							<strong className="font-semibold tabular-nums text-foreground">
								<SensitiveValue>
									{formatter.currency(expenses.totalAmount)}
								</SensitiveValue>
							</strong>
						</p>
					}
				/>
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					list={
						<ExpenseList
							emptyState={emptyState}
							onOpenPage={openExpensePage}
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
							emptyState={emptyState}
							onOpenPage={openExpensePage}
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
