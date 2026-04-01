import type { EmployeeCreate, EmployeeUpdate } from "../schemas/form";
import type { Employee } from "../schemas/model";

export const defaultFormCreateValues = (): EmployeeCreate => {
	return {
		fullName: "",
		email: "",
		oabNumber: "",
		remunerationPercent: 0,
		referrerPercent: 0.05,
		type: 0,
		role: 0,
	};
};

// TODO: refatorar
export const defaultFormUpdateValues = (
	initialValue: Employee,
): EmployeeUpdate => {
	return {
		fullName: initialValue.fullName,
		oabNumber: initialValue.oabNumber || "",
		remunerationPercent: initialValue.remunerationPercent,
		role: 999,
		email: "",
		id: initialValue.id,
		referrerPercent: 999,
		type: 999,
	};
};
