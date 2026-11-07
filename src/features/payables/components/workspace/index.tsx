import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { EntityWorkspace } from "@/shared/components/entity-workspace";
import { usePayableSections } from "../../hooks/use-sections";
import { usePayableWorkspace } from "../../hooks/use-workspace";
import {
	type PayableWorkspaceSearch,
	payableWorkspaceSearchSchema,
} from "../../schemas/workspace";
import { payableSearchDefaults } from "../../utils/default";
import { PayableStatus } from "../status";

interface PayableWorkspaceProps {
	id: number;
	search: PayableWorkspaceSearch;
	onTabChange: (tab: PayableWorkspaceSearch["tab"]) => void;
}
export function PayableWorkspace({
	id,
	search,
	onTabChange,
}: PayableWorkspaceProps) {
	const { payable } = usePayableWorkspace(id);
	const sections = usePayableSections(id);
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
			title="Título a pagar"
			identity={payable.beneficiaryName}
			subtitle={`#${id}`}
			status={<PayableStatus payable={payable} />}
			returnLink={
				<Link
					to="/contas-a-pagar"
					search={search.returnTo ?? payableSearchDefaults}
				>
					Voltar para contas a pagar
				</Link>
			}
			tab={tab}
			onTabChange={(value) =>
				onTabChange(payableWorkspaceSearchSchema.shape.tab.parse(value))
			}
			sections={sections}
		/>
	);
}
