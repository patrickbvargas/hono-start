import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { AttachmentOwnerKind } from "../schemas/form";
import { getAttachmentOwnerInput } from "../utils/owner";
import { useAttachments } from "./use-data";

interface UseAttachmentSectionOptions {
	ownerId: EntityId;
	ownerKind: AttachmentOwnerKind;
}

export function useAttachmentSection({
	ownerId,
	ownerKind,
}: UseAttachmentSectionOptions) {
	const owner = getAttachmentOwnerInput({ ownerId, ownerKind });
	const { attachments, error, isPending, retry } = useAttachments(owner);
	const session = useLoggedUserSession();
	const canDelete = hasPermission(session, "org:attachments:delete");
	const { overlay } = useOverlay<EntityId>();

	return { owner, attachments, error, isPending, canDelete, overlay, retry };
}
