import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	AuditLogDetails,
	AuditLogFilter,
	AuditLogList,
	AuditLogTable,
	auditLogSearchDefaults,
	auditLogSearchSchema,
	getAuditLogActionsQueryOptions,
	getAuditLogActorsQueryOptions,
	getAuditLogEntityTypesQueryOptions,
	getAuditLogsQueryOptions,
	useAuditLogFilter,
	useAuditLogs,
} from "@/features/audit-logs";
import { EntityView } from "@/shared/components/entity-view";
import { RouteError } from "@/shared/components/route-error";
import { ListEmptyState } from "@/shared/components/ui";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { assertCan } from "@/shared/session";

export const Route = createFileRoute("/_app/auditoria")({
	staticData: { pageTitle: ROUTES.auditLog.title },
	validateSearch: auditLogSearchSchema,
	search: {
		middlewares: [stripSearchParams(auditLogSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient, session }, deps: { search } }) => {
		assertCan(session, "org:audit_logs:read");
		await queryClient.query(getAuditLogsQueryOptions(search));
		await queryClient.query(getAuditLogActionsQueryOptions());
		await queryClient.query(getAuditLogEntityTypesQueryOptions());
		await queryClient.query(getAuditLogActorsQueryOptions());
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.auditLog.title} error={error} />
	),
});

function RouteComponent() {
	const filterController = useAuditLogFilter();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const openAuditLogPage = (id: number) => {
		void navigate({
			to: "/auditoria/$auditLogId",
			params: { auditLogId: String(id) },
			search: { tab: "overview", returnTo: search },
		});
	};
	const { auditLogs } = useAuditLogs(search);
	const { overlay } = useOverlay<EntityId>();

	const emptyState = (
		<ListEmptyState
			title="Nenhuma alteração disponível"
			description="As alterações nos registros que você pode consultar aparecerão aqui."
			hasFilters={filterController.canClearFilters}
			onClearFilters={filterController.handleClearFilters}
			hasRecords={auditLogs.total > 0}
			onFirstPage={() =>
				void navigate({ search: (previous) => ({ ...previous, page: 1 }) })
			}
		/>
	);

	return (
		<Wrapper title={ROUTES.auditLog.title}>
			<WrapperHeader>
				<AuditLogFilter controller={filterController} />
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					className="min-h-0 flex-1"
					list={
						<AuditLogList
							emptyState={emptyState}
							onOpenPage={openAuditLogPage}
							data={auditLogs}
							onView={overlay.details.open}
						/>
					}
					table={
						<AuditLogTable
							emptyState={emptyState}
							onOpenPage={openAuditLogPage}
							data={auditLogs}
							onView={overlay.details.open}
						/>
					}
				/>
				{overlay.details.render((id, state) => (
					<AuditLogDetails id={id} state={state} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
