import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	AuditLogFilter,
	AuditLogTable,
	auditLogSearchDefaults,
	auditLogSearchSchema,
	getAuditLogActionsQueryOptions,
	getAuditLogActorsQueryOptions,
	getAuditLogEntityTypesQueryOptions,
	getAuditLogsQueryOptions,
	useAuditLogs,
} from "@/features/audit-logs";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { assertCan } from "@/shared/session";

export const Route = createFileRoute("/_app/audit-log")({
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

	return (
		<Wrapper title={ROUTES.auditLog.title}>
			<WrapperHeader>
				<AuditLogFilter />
			</WrapperHeader>
			<WrapperBody>
				<AuditLogTable data={auditLogs} />
			</WrapperBody>
		</Wrapper>
	);
}
