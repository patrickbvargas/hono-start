import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	AuditLogFilter,
	AuditLogTable,
	auditLogSearchDefaults,
	auditLogSearchSchema,
	getAuditLogsQueryOptions,
	useAuditLogs,
} from "@/features/audit-logs";
import { RouteLoading } from "@/shared/components/route-loading";
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
		await queryClient.ensureQueryData(getAuditLogsQueryOptions(search));
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
				<RouteLoading />
			</WrapperHeader>
			<WrapperBody>
				<AuditLogTable data={auditLogs} />
			</WrapperBody>
		</Wrapper>
	);
}
