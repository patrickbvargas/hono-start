import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	getReceivableOptionsQueryOptions,
	getReceivablesQueryOptions,
	ReceivableDetails,
	ReceivableFilter,
	ReceivableList,
	ReceivableTable,
	receivableSearchDefaults,
	receivableSearchSchema,
	useReceivableFilter,
	useReceivables,
} from "@/features/receivables";
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
export const Route = createFileRoute("/_app/contas-a-receber")({
	beforeLoad: ({ context }) => {
		assertCan(context.session, [
			"org:receivables:read_all",
			"org:receivables:read_assigned",
		]);
	},
	staticData: { pageTitle: "Contas a receber" },
	validateSearch: receivableSearchSchema.extend(entityDetailSearchSchema.shape),
	search: { middlewares: [stripSearchParams(receivableSearchDefaults)] },
	loaderDeps: ({ search: { detailId: _detailId, ...search } }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.query(getReceivablesQueryOptions(search)),
			queryClient.query(getReceivableOptionsQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title="Contas a receber" error={error} />
	),
});
function RouteComponent() {
	const filterController = useReceivableFilter();
	const { detailId, ...search } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { receivables } = useReceivables(search);
	const { overlay } = useEntityOverlay(detailId, (id) => {
		void navigate({
			search: (previous) => ({ ...previous, detailId: id }),
			replace: id === undefined,
		});
	});
	const openPage = (id: number) => {
		void navigate({
			to: "/contas-a-receber/$receivableId",
			params: { receivableId: String(id) },
			search: { tab: "overview", returnTo: search },
		});
	};
	const emptyState = (
		<ListEmptyState
			title="Nenhum título disponível"
			description="Os títulos a receber aparecerão aqui."
			hasFilters={filterController.canClearFilters}
			onClearFilters={filterController.handleClearFilters}
			hasRecords={receivables.total > 0}
			onFirstPage={() =>
				void navigate({ search: (previous) => ({ ...previous, page: 1 }) })
			}
		/>
	);
	return (
		<Wrapper title="Contas a receber">
			<WrapperHeader>
				<ReceivableFilter
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
											{formatter.currency(receivables.totals[key])}
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
						<ReceivableTable
							data={receivables}
							emptyState={emptyState}
							onOpenPage={openPage}
							onView={overlay.details.open}
						/>
					}
					list={
						<ReceivableList
							data={receivables}
							emptyState={emptyState}
							onOpenPage={openPage}
							onView={overlay.details.open}
						/>
					}
				/>
				{overlay.details.render((id, state) => (
					<ReceivableDetails id={id} state={state} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
