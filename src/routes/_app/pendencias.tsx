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
	usePendingWorkSummary,
} from "@/features/pending-work";
import { EntityView } from "@/shared/components/entity-view";
import { RouteError } from "@/shared/components/route-error";
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
	const search = Route.useSearch();
	const { pendingWork } = usePendingWork(search);
	const { handleSelectSeverity } = usePendingWorkSummary();
	return (
		<Wrapper title={ROUTES.pendingWork.title}>
			<WrapperHeader>
				<PendingWorkFilter />
			</WrapperHeader>
			<WrapperBody>
				<div className="flex min-h-0 flex-1 flex-col gap-4 p-0.5">
					<PendingWorkSummary
						data={pendingWork}
						onSelectSeverity={handleSelectSeverity}
					/>
					<EntityView
						className="min-h-0 flex-1"
						table={<PendingWorkTable data={pendingWork} />}
						list={<PendingWorkList data={pendingWork} />}
					/>
				</div>
			</WrapperBody>
		</Wrapper>
	);
}
