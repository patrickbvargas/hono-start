import type {
	ClientCreateFormInput,
	ClientUpdateFormInput,
} from "../schemas/form";
import type { Client } from "../schemas/model";

export const defaultClientCreateValues = (): ClientCreateFormInput => ({
	fullName: "",
	document: "",
	email: "",
	phone: "",
	type: "",
	isActive: true,
});

export const defaultClientUpdateValues = (
	initialValue: Client,
): ClientUpdateFormInput => ({
	id: initialValue.id,
	fullName: initialValue.fullName,
	document: initialValue.document,
	email: initialValue.email ?? "",
	phone: initialValue.phone ?? "",
	type: initialValue.typeValue,
	isActive: initialValue.isActive,
});
