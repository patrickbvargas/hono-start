import type { EmployeeCreate, EmployeeUpdate } from "../schemas/form";
import type { Employee } from "../schemas/model";

export const defaultFormCreateValues = (): EmployeeCreate => ({
	fullName: "",
	email: "",
	oabNumber: "",
	remunerationPercent: 0,
	referrerPercent: 0,
	type: 0,
	role: 0,
	isActive: true,
});

export const defaultFormUpdateValues = (
	initialValue: Employee,
): EmployeeUpdate => ({
	id: initialValue.id,
	fullName: initialValue.fullName,
	email: initialValue.email,
	oabNumber: initialValue.oabNumber || "",
	remunerationPercent: initialValue.remunerationPercent,
	referrerPercent: initialValue.referrerPercent,
	type: initialValue.typeId,
	role: initialValue.roleId,
	isActive: initialValue.isActive,
});
