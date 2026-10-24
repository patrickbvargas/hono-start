import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	FeeDelete,
	FeeDetails,
	FeeFilter,
	FeeForm,
	FeeList,
	FeeRestore,
	FeeTable,
	feeSearchDefaults,
	feeSearchSchema,
	getFeesQueryOptions,
	getSelectableFeeContractsQueryOptions,
	getSelectableFeeRevenuesQueryOptions,
	useFees,
} from "@/features/fees";
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
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";

export const Route = createFileRoute("/_app/honorarios")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.fee.title) }],
	}),
	validateSearch: feeSearchSchema,
	search: {
		middlewares: [stripSearchParams(feeSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.query(getFeesQueryOptions(search)),
			queryClient.query(getSelectableFeeContractsQueryOptions()),
			queryClient.query(getSelectableFeeRevenuesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.fee.title} error={error} />
	),
});

function RouteComponent() {
	const search = Route.useSearch();
	const { fees } = useFees(search);
	const { overlay } = useOverlay<EntityId>();
	const session = useLoggedUserSession();
	const isAdmin =
		hasPermission(session, "org:fees:delete") ||
		hasPermission(session, "org:fees:restore");

	return (
		<Wrapper
			title={ROUTES.fee.title}
			actions={
				<ButtonNew
					permission="org:fees:create"
					label="Novo honorário"
					onClick={() => overlay.create.open()}
				/>
			}
		>
			<WrapperHeader className="flex-wrap md:flex-nowrap">
				<FeeFilter
					summary={
						<p className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
							Total filtrado:{" "}
							<strong className="font-semibold tabular-nums text-foreground">
								{formatter.currency(fees.totalAmount)}
							</strong>
						</p>
					}
				/>
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					list={
						<FeeList
							data={fees}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
					table={
						<FeeTable
							data={fees}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
				/>
				{overlay.create.render((state) => (
					<FeeForm state={state} onSuccess={state.close} />
				))}
				{overlay.edit.render((id, state) => (
					<FeeForm id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.delete.render((id, state) => (
					<FeeDelete id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.restore.render((id, state) => (
					<FeeRestore id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.details.render((id, state) => (
					<FeeDetails
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
