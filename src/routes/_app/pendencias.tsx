import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	getSelectableContractClientsQueryOptions,
	getSelectableContractEmployeesQueryOptions,
} from "@/features/contracts";
import {
	getPendingWorkQueryOptions,
	PendingWorkFilter,
	PendingWorkList,
	PendingWorkSummary,
	PendingWorkTable,
	pendingWorkSearchDefaults,
	pendingWorkSearchSchema,
	usePendingWork,
	usePendingWorkFilter,
	usePendingWorkSummary,
} from "@/features/pending-work";
import { EntityView } from "@/shared/components/entity-view";
import { RouteError } from "@/shared/components/route-error";
import { ListEmptyState } from "@/shared/components/ui";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { getPageTitle, ROUTES } from "@/shared/config/routes";
import { assertCan } from "@/shared/session";

export const Route = createFileRoute("/_app/pendencias")({
	head: () => ({ meta: [{ title: getPageTitle(ROUTES.pendingWork.title) }] }),
	validateSearch: pendingWorkSearchSchema,
	search: { middlewares: [stripSearchParams(pendingWorkSearchDefaults)] },
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient, session }, deps: { search } }) => {
		assertCan(session, [
			"org:contracts:read_all",
			"org:contracts:read_assigned",
		]);
		await Promise.all([
			queryClient.query(getPendingWorkQueryOptions(search)),
			queryClient.query(getSelectableContractClientsQueryOptions()),
			queryClient.query(getSelectableContractEmployeesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.pendingWork.title} error={error} />
	),
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const filterController = usePendingWorkFilter();
	const search = Route.useSearch();
	const { pendingWork } = usePendingWork(search);
	const { handleSelectSeverity } = usePendingWorkSummary();
	const emptyState = (
		<ListEmptyState
			title="Nenhuma pendência no momento"
			description="Não há pendências nos contratos disponíveis para você."
			hasFilters={filterController.canClearFilters}
			onClearFilters={filterController.handleClearFilters}
			hasRecords={pendingWork.total > 0}
			onFirstPage={() =>
				void navigate({ search: (previous) => ({ ...previous, page: 1 }) })
			}
		/>
	);

	return (
		<Wrapper title={ROUTES.pendingWork.title}>
			<WrapperHeader>
				<PendingWorkFilter controller={filterController} />
			</WrapperHeader>
			<WrapperBody>
				<div className="flex min-h-0 flex-1 flex-col gap-4 p-0.5">
					<PendingWorkSummary
						data={pendingWork}
						onSelectSeverity={handleSelectSeverity}
					/>
					<EntityView
						className="min-h-0 flex-1"
						table={
							<PendingWorkTable emptyState={emptyState} data={pendingWork} />
						}
						list={
							<PendingWorkList emptyState={emptyState} data={pendingWork} />
						}
					/>
				</div>
			</WrapperBody>
		</Wrapper>
	);
}
