import { ATTACHMENT_ERRORS } from "../constants/errors";
import type {
	AttachmentOwnerInput,
	AttachmentOwnerKind,
} from "../schemas/form";

function getAttachmentOwnerCount(data: AttachmentOwnerInput) {
	return [
		data.personId,
		data.clientId,
		data.employeeId,
		data.contractId,
		data.expenseId,
		data.feeId,
		data.remunerationId,
	].filter((value) => value !== undefined).length;
}

export function assertSingleAttachmentOwnerContext(data: AttachmentOwnerInput) {
	if (getAttachmentOwnerCount(data) !== 1) {
		throw new Error(ATTACHMENT_ERRORS.OWNER_REQUIRED);
	}
}

export function assertAttachmentOwnerCanReceiveUpload(params: {
	deletedAt: Date | null;
	isWritableContract?: boolean;
	ownerKind: AttachmentOwnerKind;
}) {
	if (params.deletedAt) {
		throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
	}

	if (params.ownerKind === "contract" && !params.isWritableContract) {
		throw new Error(ATTACHMENT_ERRORS.CONTRACT_NOT_WRITABLE);
	}
}
