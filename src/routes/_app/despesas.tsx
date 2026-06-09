import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
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
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";

export const Route = createFileRoute("/_app/despesas")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.expense.title) }],
	}),
	validateSearch: zodValidator(expenseSearchSchema),
	search: {
		middlewares: [stripSearchParams(expenseSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.ensureQueryData(getExpensesQueryOptions(search)),
			queryClient.ensureQueryData(getExpenseCategoriesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.expense.title} error={error} />
	),
});

function RouteComponent() {
	const search = Route.useSearch();
	const { expenses } = useExpenses(search);
	const { overlay } = useOverlay<EntityId>();
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	return (
		<Wrapper
			title={ROUTES.expense.title}
			actions={
				<ButtonNew label="Nova despesa" onClick={() => overlay.create.open()} />
			}
		>
			<WrapperHeader>
				<ExpenseFilter />
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
