import type { EmployeeCreateInput, EmployeeUpdateInput } from "../schemas/form";
import type { EmployeeDetail } from "../schemas/model";
import type { EmployeeSearch } from "../schemas/search";

export const defaultEmployeeCreateValues = (): EmployeeCreateInput => ({
	fullName: "",
	oabNumber: "",
	remunerationPercent: 0,
	referrerPercent: 0,
	type: "",
	isActive: true,
});

export const defaultEmployeeUpdateValues = (
	initialValue: EmployeeDetail,
): EmployeeUpdateInput => ({
	id: initialValue.id,
	fullName: initialValue.fullName,
	oabNumber: initialValue.oabNumber || "",
	remunerationPercent: initialValue.remunerationPercent,
	referrerPercent: initialValue.referrerPercent,
	type: initialValue.typeValue,
	isActive: initialValue.isActive,
});

export const employeeSearchDefaults: EmployeeSearch = {
	page: 1,
	limit: 25,
	column: "fullName",
	direction: "asc",
	query: "",
	type: [],
	active: "all",
	status: "active",
};
