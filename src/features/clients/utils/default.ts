import type { ClientCreateInput, ClientUpdateInput } from "../schemas/form";
import type { ClientDetail } from "../schemas/model";

export const defaultClientCreateValues = (): ClientCreateInput => ({
	fullName: "",
	document: "",
	email: "",
	phone: "",
	type: "",
	isActive: true,
});

export const defaultClientUpdateValues = (
	initialValue: ClientDetail,
): ClientUpdateInput => ({
	id: initialValue.id,
	fullName: initialValue.fullName,
	document: initialValue.document,
	email: initialValue.email ?? "",
	phone: initialValue.phone ?? "",
	type: initialValue.typeValue,
	isActive: initialValue.isActive,
});
