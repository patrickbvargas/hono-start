import { Link } from "@tanstack/react-router";
import { EntityWorkspace } from "@/shared/components/entity-workspace";
import { Badge, ScrollArea } from "@/shared/components/ui";
import { useAuditLogWorkspace } from "../../hooks/use-workspace";
import {
	type AuditLogWorkspaceSearch,
	auditLogWorkspaceSearchSchema,
} from "../../schemas/workspace";
import { auditLogSearchDefaults } from "../../utils/default";
import { AuditLogOverview } from "../details/overview";

interface AuditLogWorkspaceProps {
	id: number;
	search: AuditLogWorkspaceSearch;
	onTabChange: (tab: AuditLogWorkspaceSearch["tab"]) => void;
}
export function AuditLogWorkspace({
	id,
	search,
	onTabChange,
}: AuditLogWorkspaceProps) {
	const { title } = useAuditLogWorkspace(id);
	return (
		<EntityWorkspace
			title="Registro de auditoria"
			identity={title}
			subtitle={`#${id}`}
			status={<Badge variant="secondary">Somente leitura</Badge>}
			returnLink={
				<Link
					to="/auditoria"
					search={search.returnTo ?? auditLogSearchDefaults}
				>
					Voltar para auditoria
				</Link>
			}
			tab={search.tab}
			onTabChange={(tab) =>
				onTabChange(auditLogWorkspaceSearchSchema.shape.tab.parse(tab))
			}
			sections={[
				{
					value: "overview",
					label: "Visão geral",
					content: <AuditLogOverview id={id} section="overview" />,
				},
				{
					value: "changes",
					label: "Alterações",
					expanded: true,
					content: (
						<ScrollArea className="h-full min-h-0 w-full">
							<AuditLogOverview id={id} section="changes" />
						</ScrollArea>
					),
				},
				{
					value: "technical",
					label: "Dados técnicos",
					expanded: true,
					content: (
						<ScrollArea className="h-full min-h-0 w-full">
							<AuditLogOverview id={id} section="technical" />
						</ScrollArea>
					),
				},
			]}
		/>
	);
}
