import { NavigationLink } from "@/shared/components/navigation-link";
import { buttonVariants } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { usePendingWorkNavigation } from "../../hooks/use-navigation";
import type { PendingWork } from "../../schemas/model";

interface PendingWorkActionProps {
	item: PendingWork;
}

export function PendingWorkAction({ item }: PendingWorkActionProps) {
	const { workspaceSearch } = usePendingWorkNavigation();
	return (
		<NavigationLink
			to="/contratos/$contractId"
			params={{ contractId: String(item.contractId) }}
			search={workspaceSearch(item.tab)}
			title={`Abrir ${item.tab === "finance" ? "financeiro" : "equipe"} de ${item.processNumber}`}
			className={cn(
				buttonVariants({ variant: "outline", size: "sm" }),
				"no-underline",
			)}
		>
			{item.tab === "finance" ? "Abrir financeiro" : "Abrir equipe"}
		</NavigationLink>
	);
}
