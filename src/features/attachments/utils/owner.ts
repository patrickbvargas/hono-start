import type {
	AttachmentOwnerInput,
	AttachmentOwnerKind,
} from "../schemas/form";

export function getAttachmentOwnerContext(input: AttachmentOwnerInput): {
	ownerId: number;
	ownerKind: AttachmentOwnerKind;
} {
	if (input.clientId) {
		return { ownerKind: "client", ownerId: input.clientId };
	}

	if (input.employeeId) {
		return { ownerKind: "employee", ownerId: input.employeeId };
	}

	if (input.contractId) {
		return { ownerKind: "contract", ownerId: input.contractId };
	}

	if (input.expenseId) {
		return { ownerKind: "expense", ownerId: input.expenseId };
	}
	if (input.feeId) {
		return { ownerKind: "fee", ownerId: input.feeId };
	}
	return { ownerKind: "remuneration", ownerId: input.remunerationId as number };
}

export function getAttachmentOwnerInput(params: {
	ownerId: number;
	ownerKind: AttachmentOwnerKind;
}): AttachmentOwnerInput {
	switch (params.ownerKind) {
		case "client":
			return { clientId: params.ownerId };
		case "employee":
			return { employeeId: params.ownerId };
		case "contract":
			return { contractId: params.ownerId };
		case "expense":
			return { expenseId: params.ownerId };
		case "fee":
			return { feeId: params.ownerId };
		case "remuneration":
			return { remunerationId: params.ownerId };
	}
}
