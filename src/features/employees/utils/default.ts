import type { EmployeeCreateInput, EmployeeUpdateInput } from "../schemas/form";
import type { EmployeeDetail } from "../schemas/model";

export const defaultEmployeeCreateValues = (): EmployeeCreateInput => ({
	fullName: "",
	email: "",
	oabNumber: "",
	remunerationPercent: 0,
	referrerPercent: 0,
	type: "",
	role: "",
	isActive: true,
});

export const defaultEmployeeUpdateValues = (
	initialValue: EmployeeDetail,
): EmployeeUpdateInput => ({
	id: initialValue.id,
	fullName: initialValue.fullName,
	email: initialValue.email,
	oabNumber: initialValue.oabNumber || "",
	remunerationPercent: initialValue.remunerationPercent,
	referrerPercent: initialValue.referrerPercent,
	type: initialValue.typeValue,
	role: initialValue.roleValue,
	isActive: initialValue.isActive,
});
