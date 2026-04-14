import type { ClientCreate, ClientUpdate } from "../schemas/form";
import type { Client } from "../schemas/model";

export const defaultClientCreateValues = (): ClientCreate => ({
	fullName: "",
	document: "",
	email: "",
	phone: "",
	type: "",
	isActive: true,
});

export const defaultClientUpdateValues = (
	initialValue: Client,
): ClientUpdate => ({
	id: initialValue.id,
	fullName: initialValue.fullName,
	document: initialValue.document,
	email: initialValue.email ?? "",
	phone: initialValue.phone ?? "",
	type: initialValue.typeValue,
	isActive: initialValue.isActive,
});
