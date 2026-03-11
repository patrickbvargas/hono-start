import type { EmployeeCreate } from "../schemas/form";

export const getDefaultFormCreateValues = (): EmployeeCreate => {
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
