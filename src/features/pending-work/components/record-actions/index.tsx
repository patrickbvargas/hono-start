import { RelatedRecordActions } from "@/features/related-records";
import { usePendingWorkNavigation } from "../../hooks/use-navigation";
import type { PendingWork } from "../../schemas/model";

interface PendingWorkRecordActionsProps {
	item: PendingWork;
	presentation?: "dropdown" | "context";
	onView: (id: number) => void;
}

export function PendingWorkRecordActions({
	item,
	presentation,
	onView,
}: PendingWorkRecordActionsProps) {
	const { openWorkspace } = usePendingWorkNavigation();
	return (
		<RelatedRecordActions
			kind="contract"
			id={item.contractId}
			presentation={presentation}
			onView={() => onView(item.contractId)}
			onOpenPage={() => {
				void openWorkspace(item.contractId, item.tab);
			}}
		/>
	);
}
