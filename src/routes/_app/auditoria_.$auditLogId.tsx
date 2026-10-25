import { createFileRoute } from "@tanstack/react-router";
import {
	AuditLogWorkspace,
	auditLogWorkspaceSearchSchema,
	getAuditLogByIdQueryOptions,
} from "@/features/audit-logs";
import { RouteError } from "@/shared/components/route-error";
import { getPageTitle } from "@/shared/config/routes";
import { entityIdSchema } from "@/shared/schemas/entity";
export const Route = createFileRoute("/_app/auditoria_/$auditLogId")({
	head: () => ({ meta: [{ title: getPageTitle("Registro de auditoria") }] }),
	validateSearch: auditLogWorkspaceSearchSchema,
	loader: async ({ context: { queryClient }, params }) => {
		const { id } = entityIdSchema.parse({ id: Number(params.auditLogId) });
		await queryClient.query(getAuditLogByIdQueryOptions(id));
	},
	component: AuditLogPage,
	errorComponent: ({ error }) => (
		<RouteError title="Registro de auditoria" error={error} />
	),
});
function AuditLogPage() {
	const params = Route.useParams();
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<AuditLogWorkspace
			key={params.auditLogId}
			id={Number(params.auditLogId)}
			onTabChange={(tab) => {
				void navigate({
					to: "/auditoria/$auditLogId",
					params: { auditLogId: params.auditLogId },
					search: (previous) => ({ ...previous, tab }),
					replace: true,
				});
			}}
			search={search}
		/>
	);
}
