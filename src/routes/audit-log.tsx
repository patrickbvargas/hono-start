import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	AuditLogFilter,
	AuditLogTable,
	auditLogSearchSchema,
	getAuditLogsQueryOptions,
	useAuditLogData,
} from "@/features/audit-logs";
import { AuthenticatedShell } from "@/shared/components/authenticated-shell";
import { RouteLoading } from "@/shared/components/route-loading";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { assertCan, requireRouteSession } from "@/shared/session";

export const Route = createFileRoute("/audit-log")({
	validateSearch: zodValidator(auditLogSearchSchema),
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		const session = await requireRouteSession(queryClient);
		assertCan(session, "audit-log.view");
		await queryClient.ensureQueryData(getAuditLogsQueryOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { auditLogs } = useAuditLogData(search);

	return (
		<AuthenticatedShell>
			<Wrapper title={ROUTES.auditLog.title}>
				<WrapperHeader>
					<AuditLogFilter />
					<RouteLoading />
				</WrapperHeader>
				<WrapperBody>
					<AuditLogTable data={auditLogs} />
				</WrapperBody>
			</Wrapper>
		</AuthenticatedShell>
	);
}
