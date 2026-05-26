import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
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
	useAuditLogs,
} from "@/features/audit-logs";
import { EntityView } from "@/shared/components/entity-view";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { getPageTitle, ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { assertCan } from "@/shared/session";

export const Route = createFileRoute("/_app/auditoria")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.auditLog.title) }],
	}),
	validateSearch: zodValidator(auditLogSearchSchema),
	search: {
		middlewares: [stripSearchParams(auditLogSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient, session }, deps: { search } }) => {
		assertCan(session, "audit-log.view");
		await Promise.all([
			queryClient.ensureQueryData(getAuditLogsQueryOptions(search)),
			queryClient.ensureQueryData(getAuditLogActionsQueryOptions()),
			queryClient.ensureQueryData(getAuditLogEntityTypesQueryOptions()),
			queryClient.ensureQueryData(getAuditLogActorsQueryOptions()),
		]);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { auditLogs } = useAuditLogs(search);
	const { overlay } = useOverlay<EntityId>();

	return (
		<Wrapper title={ROUTES.auditLog.title}>
			<WrapperHeader>
				<AuditLogFilter />
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					className="min-h-0 flex-1"
					list={<AuditLogList data={auditLogs} onView={overlay.details.open} />}
					table={
						<AuditLogTable data={auditLogs} onView={overlay.details.open} />
					}
				/>
				{overlay.details.render((id, state) => (
					<AuditLogDetails id={id} state={state} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
