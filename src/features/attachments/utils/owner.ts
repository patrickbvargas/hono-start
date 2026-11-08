import type {
	AttachmentOwnerInput,
	AttachmentOwnerKind,
} from "../schemas/form";
export function getAttachmentOwnerContext(input: AttachmentOwnerInput): {
	ownerId: number;
	ownerKind: AttachmentOwnerKind;
} {
	const entries: Array<[AttachmentOwnerKind, number | undefined]> = [
		["person", input.personId],
		["contract", input.contractId],
		["expense", input.expenseId],
		["receivable", input.receivableId],
		["payable", input.payableId],
		["receipt", input.receiptId],
		["payment", input.paymentId],
		["remuneration-payable", input.remunerationPayableId],
	];
	const owners = entries.filter(
		(entry): entry is [AttachmentOwnerKind, number] => entry[1] !== undefined,
	);
	if (owners.length !== 1) {
		throw new Error("Selecione exatamente um contexto para o anexo.");
	}
	return { ownerKind: owners[0][0], ownerId: owners[0][1] };
}
export function getAttachmentOwnerInput({
	ownerKind,
	ownerId,
}: {
	ownerId: number;
	ownerKind: AttachmentOwnerKind;
}): AttachmentOwnerInput {
	const fields = {
		person: "personId",
		contract: "contractId",
		expense: "expenseId",
		receivable: "receivableId",
		payable: "payableId",
		receipt: "receiptId",
		payment: "paymentId",
		"remuneration-payable": "remunerationPayableId",
	} as const;
	return { [fields[ownerKind]]: ownerId };
}
