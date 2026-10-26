import { Link } from "@tanstack/react-router";
import { usePendingWorkNavigation } from "../../hooks/use-navigation";
import type { PendingWork } from "../../schemas/model";

interface PendingWorkContractLinkProps {
	item: PendingWork;
}

export function PendingWorkContractLink({
	item,
}: PendingWorkContractLinkProps) {
	const { workspaceSearch } = usePendingWorkNavigation();
	return (
		<Link
			to="/contratos/$contractId"
			params={{ contractId: String(item.contractId) }}
			search={workspaceSearch("overview")}
			title={`Abrir página do contrato ${item.processNumber}`}
			className="inline-flex max-w-full cursor-pointer rounded-sm px-1 -mx-1 text-inherit text-left transition-colors hover:bg-accent/30 hover:ring-1 hover:ring-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			{item.processNumber}
		</Link>
	);
}
