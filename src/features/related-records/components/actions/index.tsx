import { EntityActions } from "@/shared/components/entity-actions";
import type { EntityId } from "@/shared/schemas/entity";
import { useRecordPage } from "../../hooks/use-record-page";
import type { RelatedRecordKind } from "../../schemas/record";

const readPermissions = {
	client: "org:clients:read",
	employee: "org:employees:read",
	contract: ["org:contracts:read_all", "org:contracts:read_assigned"],
	fee: ["org:fees:read_all", "org:fees:read_assigned"],
	expense: "org:expenses:read",
	remuneration: ["org:remunerations:read_all", "org:remunerations:read_own"],
} as const;

interface RelatedRecordActionsProps {
	kind: RelatedRecordKind;
	id: EntityId;
	presentation?: "dropdown" | "context";
	onView: () => void;
	onOpenPage?: () => void;
}

export function RelatedRecordActions({
	kind,
	id,
	presentation,
	onView,
	onOpenPage,
}: RelatedRecordActionsProps) {
	const { openPage } = useRecordPage(kind, id);
	return (
		<EntityActions
			presentation={presentation}
			viewPermission={readPermissions[kind]}
			onOpenPage={
				onOpenPage ??
				(() => {
					void openPage();
				})
			}
			onView={onView}
		/>
	);
}
