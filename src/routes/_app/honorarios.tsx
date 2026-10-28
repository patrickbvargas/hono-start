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
	getFeeRevenueTypesQueryOptions,
	getFeesQueryOptions,
	getSelectableFeeContractsQueryOptions,
	useFeeFilter,
	useFees,
} from "@/features/fees";
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
import { getPageTitle, ROUTES } from "@/shared/config/routes";
import { useEntityOverlay } from "@/shared/hooks/use-entity-overlay";
import { formatter } from "@/shared/lib/formatter";
import { entityDetailSearchSchema } from "@/shared/schemas/entity-detail-search";
import { hasPermission, useLoggedUserSession } from "@/shared/session";

export const Route = createFileRoute("/_app/honorarios")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.fee.title) }],
	}),
	validateSearch: feeSearchSchema.extend(entityDetailSearchSchema.shape),
	search: {
		middlewares: [stripSearchParams(feeSearchDefaults)],
	},
	loaderDeps: ({ search: { detailId: _detailId, ...search } }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.query(getFeesQueryOptions(search)),
			queryClient.query(getSelectableFeeContractsQueryOptions()),
			queryClient.query(getFeeRevenueTypesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.fee.title} error={error} />
	),
});

function RouteComponent() {
	const filterController = useFeeFilter();
	const { detailId, ...search } = Route.useSearch();
	const navigate = Route.useNavigate();
	const openFeePage = (id: number) => {
		void navigate({
			to: "/honorarios/$feeId",
			params: { feeId: String(id) },
			search: { tab: "overview", returnTo: search },
		});
	};
	const { fees } = useFees(search);
	const { overlay } = useEntityOverlay(detailId, (id) => {
		void navigate({
			search: (previous) => ({ ...previous, detailId: id }),
			replace: id === undefined,
		});
	});
	const session = useLoggedUserSession();
	const isAdmin =
		hasPermission(session, "org:fees:delete") ||
		hasPermission(session, "org:fees:restore");

	const emptyState = (
		<ListEmptyState
			title="Nenhum recebimento disponível"
			description="Os recebimentos registrados nos contratos aparecerão aqui."
			hasFilters={filterController.canClearFilters}
			onClearFilters={filterController.handleClearFilters}
			hasRecords={fees.total > 0}
			onFirstPage={() =>
				void navigate({ search: (previous) => ({ ...previous, page: 1 }) })
			}
			createAction={
				hasPermission(session, "org:fees:create") ? (
					<ButtonNew
						permission="org:fees:create"
						label="Novo recebimento"
						onClick={() => overlay.create.open()}
					/>
				) : null
			}
		/>
	);

	return (
		<Wrapper
			title={ROUTES.fee.title}
			actions={
				<ButtonNew
					permission="org:fees:create"
					label="Novo recebimento"
					onClick={() => overlay.create.open()}
				/>
			}
		>
			<WrapperHeader className="flex-wrap md:flex-nowrap">
				<FeeFilter
					controller={filterController}
					summary={
						<p className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
							Total filtrado:{" "}
							<strong className="font-semibold tabular-nums text-foreground">
								<SensitiveValue>
									{formatter.currency(fees.totalAmount)}
								</SensitiveValue>
							</strong>
						</p>
					}
				/>
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					list={
						<FeeList
							emptyState={emptyState}
							onOpenPage={openFeePage}
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
							emptyState={emptyState}
							onOpenPage={openFeePage}
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
