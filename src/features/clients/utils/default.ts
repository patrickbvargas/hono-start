import type { ClientCreateInput, ClientUpdateInput } from "../schemas/form";
import type { ClientDetail } from "../schemas/model";
import type { ClientSearch } from "../schemas/search";

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

export const clientSearchDefaults: ClientSearch = {
	page: 1,
	limit: 25,
	column: "fullName",
	direction: "asc",
	query: "",
	type: [],
	active: "all",
	status: "active",
};
