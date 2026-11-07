import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	getPayableOptionsQueryOptions,
	getPayablesQueryOptions,
	PayableDetails,
	PayableFilter,
	PayableList,
	PayableTable,
	payableSearchDefaults,
	payableSearchSchema,
	usePayableFilter,
	usePayables,
} from "@/features/payables";
import { EntityView } from "@/shared/components/entity-view";
import { RouteError } from "@/shared/components/route-error";
import { ListEmptyState } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { useEntityOverlay } from "@/shared/hooks/use-entity-overlay";
import { formatter } from "@/shared/lib/formatter";
import { entityDetailSearchSchema } from "@/shared/schemas/entity-detail-search";
import { assertCan } from "@/shared/session";
export const Route = createFileRoute("/_app/contas-a-pagar")({
	beforeLoad: ({ context }) => {
		assertCan(context.session, [
			"org:payables:read_all",
			"org:payables:read_own",
		]);
	},
	staticData: { pageTitle: "Contas a pagar" },
	validateSearch: payableSearchSchema.extend(entityDetailSearchSchema.shape),
	search: { middlewares: [stripSearchParams(payableSearchDefaults)] },
	loaderDeps: ({ search: { detailId: _detailId, ...search } }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.query(getPayablesQueryOptions(search)),
			queryClient.query(getPayableOptionsQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title="Contas a pagar" error={error} />
	),
});
function RouteComponent() {
	const filterController = usePayableFilter();
	const { detailId, ...search } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { payables } = usePayables(search);
	const { overlay } = useEntityOverlay(detailId, (id) => {
		void navigate({
			search: (previous) => ({ ...previous, detailId: id }),
			replace: id === undefined,
		});
	});
	const openPage = (id: number) => {
		void navigate({
			to: "/contas-a-pagar/$payableId",
			params: { payableId: String(id) },
			search: { tab: "overview", returnTo: search },
		});
	};
	const emptyState = (
		<ListEmptyState
			title="Nenhum título disponível"
			description="Os títulos a pagar aparecerão aqui."
			hasFilters={filterController.canClearFilters}
			onClearFilters={filterController.handleClearFilters}
			hasRecords={payables.total > 0}
			onFirstPage={() =>
				void navigate({ search: (previous) => ({ ...previous, page: 1 }) })
			}
		/>
	);
	return (
		<Wrapper title="Contas a pagar">
			<WrapperHeader>
				<PayableFilter
					controller={filterController}
					summary={
						<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
							{(
								[
									["amount", "Nominal ativo"],
									["principalAbated", "Principal abatido"],
									["balance", "Em aberto"],
									["overdue", "Vencido"],
									["cancelled", "Cancelado"],
								] as const
							).map(([key, label]) => (
								<p key={key} className="whitespace-nowrap">
									{label}:{" "}
									<strong className="font-semibold tabular-nums text-foreground">
										<SensitiveValue>
											{formatter.currency(payables.totals[key])}
										</SensitiveValue>
									</strong>
								</p>
							))}
						</div>
					}
				/>
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					table={
						<PayableTable
							data={payables}
							emptyState={emptyState}
							onOpenPage={openPage}
							onView={overlay.details.open}
						/>
					}
					list={
						<PayableList
							data={payables}
							emptyState={emptyState}
							onOpenPage={openPage}
							onView={overlay.details.open}
						/>
					}
				/>
				{overlay.details.render((id, state) => (
					<PayableDetails id={id} state={state} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
