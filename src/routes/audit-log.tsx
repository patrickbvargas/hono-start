import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	AuditLogFilter,
	AuditLogTable,
	auditLogSearchSchema,
	getAuditLogsQueryOptions,
} from "@/features/audit-logs";
import { RouteLoading } from "@/shared/components/route-loading";
import { Wrapper } from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { assertCan, getLoggedUserSession } from "@/shared/session";

export const Route = createFileRoute("/audit-log")({
	validateSearch: zodValidator(auditLogSearchSchema),
	beforeLoad: () => {
		const session = getLoggedUserSession();
		assertCan(session, "audit-log.view");
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getAuditLogsQueryOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getAuditLogsQueryOptions(search));

	return (
		<Wrapper title={ROUTES.auditLog.title}>
			<Wrapper.Header>
				<AuditLogFilter />
				<RouteLoading />
			</Wrapper.Header>
			<Wrapper.Body>
				<AuditLogTable data={data} />
			</Wrapper.Body>
		</Wrapper>
	);
}
