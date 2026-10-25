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
	useAuditLogs,
} from "@/features/audit-logs";
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
import { assertCan } from "@/shared/session";

export const Route = createFileRoute("/_app/auditoria")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.auditLog.title) }],
	}),
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

	return (
		<Wrapper title={ROUTES.auditLog.title}>
			<WrapperHeader>
				<AuditLogFilter />
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					className="min-h-0 flex-1"
					list={
						<AuditLogList
							onOpenPage={openAuditLogPage}
							data={auditLogs}
							onView={overlay.details.open}
						/>
					}
					table={
						<AuditLogTable
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
