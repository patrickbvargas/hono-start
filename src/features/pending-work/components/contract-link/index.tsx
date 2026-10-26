import { NavigationLink } from "@/shared/components/navigation-link";
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
		<NavigationLink
			to="/contratos/$contractId"
			params={{ contractId: String(item.contractId) }}
			search={workspaceSearch("overview")}
			title={`Abrir página do contrato ${item.processNumber}`}
			className="inline-flex max-w-full rounded-sm text-left underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			{item.processNumber}
		</NavigationLink>
	);
}
