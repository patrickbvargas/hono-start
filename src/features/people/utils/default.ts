import type { PersonCreateInput, PersonUpdateInput } from "../schemas/form";
import type { PersonDetail } from "../schemas/model";
import type { PersonSearch } from "../schemas/search";

export const defaultPersonCreateValues = (): PersonCreateInput => ({
	fullName: "",
	document: "",
	email: "",
	phone: "",
	type: "",
	isActive: true,
	isGeneric: false,
	isCustomer: true,
	isSupplier: false,
	isEmployee: false,
	employeeType: "",
	oabNumber: "",
	remunerationPercent: 0,
	referrerPercent: 0,
});

export const defaultPersonUpdateValues = (
	initialValue: PersonDetail,
): PersonUpdateInput => ({
	id: initialValue.id,
	fullName: initialValue.fullName,
	document: initialValue.document,
	email: initialValue.email ?? "",
	phone: initialValue.phone ?? "",
	type: initialValue.typeValue,
	isActive: initialValue.isActive,
	isGeneric: initialValue.isGeneric,
	isCustomer: initialValue.isCustomer,
	isSupplier: initialValue.isSupplier,
	isEmployee: initialValue.isEmployee,
	employeeType: initialValue.professional?.type ?? "",
	oabNumber: initialValue.professional?.oabNumber ?? "",
	remunerationPercent: initialValue.professional?.remunerationPercent ?? 0,
	referrerPercent: initialValue.professional?.referrerPercent ?? 0,
});

export const personSearchDefaults: PersonSearch = {
	page: 1,
	limit: 25,
	column: "fullName",
	direction: "asc",
	query: "",
	type: [],
	roles: [],
	employeeType: [],
	active: "all",
	status: "active",
};
