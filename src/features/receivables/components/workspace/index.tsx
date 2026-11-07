import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { EntityWorkspace } from "@/shared/components/entity-workspace";
import { useReceivableSections } from "../../hooks/use-sections";
import { useReceivableWorkspace } from "../../hooks/use-workspace";
import {
	type ReceivableWorkspaceSearch,
	receivableWorkspaceSearchSchema,
} from "../../schemas/workspace";
import { receivableSearchDefaults } from "../../utils/default";
import { ReceivableStatus } from "../status";

interface ReceivableWorkspaceProps {
	id: number;
	search: ReceivableWorkspaceSearch;
	onTabChange: (tab: ReceivableWorkspaceSearch["tab"]) => void;
}
export function ReceivableWorkspace({
	id,
	search,
	onTabChange,
}: ReceivableWorkspaceProps) {
	const { receivable } = useReceivableWorkspace(id);
	const sections = useReceivableSections(id);
	const tab = sections.some((section) => section.value === search.tab)
		? search.tab
		: "overview";
	useEffect(() => {
		if (search.tab !== tab) {
			onTabChange(tab);
		}
	}, [search.tab, tab, onTabChange]);
	return (
		<EntityWorkspace
			title="Título a receber"
			identity={receivable.debtorName}
			subtitle={`#${id}`}
			status={<ReceivableStatus receivable={receivable} />}
			returnLink={
				<Link
					to="/contas-a-receber"
					search={search.returnTo ?? receivableSearchDefaults}
				>
					Voltar para contas a receber
				</Link>
			}
			tab={tab}
			onTabChange={(value) =>
				onTabChange(receivableWorkspaceSearchSchema.shape.tab.parse(value))
			}
			sections={sections}
		/>
	);
}
