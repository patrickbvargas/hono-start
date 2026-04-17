import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
import {
	assertCanManageEmployees,
	getServerEmployeeScope,
	getServerLoggedUserSession,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import {
	createEmployee,
	deleteEmployee,
	restoreEmployee,
	updateEmployee,
} from "../data/mutations";
import {
	employeeCreateInputSchema,
	employeeIdInputSchema,
	employeeUpdateInputSchema,
} from "../schemas/form";

const createEmployeeFn = createServerFn({ method: "POST" })
	.inputValidator(employeeCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			assertCanManageEmployees(getServerLoggedUserSession());
			const { firmId } = getServerEmployeeScope();

			return await createEmployee({ firmId, input: data });
		} catch (error) {
			console.error("[createEmployee]", error);
			if (isPrismaUniqueConstraintError(error, ["email"])) {
				throw new Error(EMPLOYEE_ERRORS.EMAIL_ALREADY_IN_USE);
			}

			if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
				throw error;
			}

			throw new Error(EMPLOYEE_ERRORS.CREATE_FAILED);
		}
	});

const updateEmployeeFn = createServerFn({ method: "POST" })
	.inputValidator(employeeUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			assertCanManageEmployees(getServerLoggedUserSession());
			const { firmId } = getServerEmployeeScope();

			return await updateEmployee({ firmId, input: data });
		} catch (error) {
			console.error("[updateEmployee]", error);
			if (isPrismaUniqueConstraintError(error, ["email"])) {
				throw new Error(EMPLOYEE_ERRORS.EMAIL_ALREADY_IN_USE);
			}

			if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
				throw error;
			}

			throw new Error(EMPLOYEE_ERRORS.UPDATE_FAILED);
		}
	});

const deleteEmployeeFn = createServerFn({ method: "POST" })
	.inputValidator(employeeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			assertCanManageEmployees(getServerLoggedUserSession());
			const { firmId } = getServerEmployeeScope();

			return await deleteEmployee({ firmId, id: data.id });
		} catch (error) {
			console.error("[deleteEmployee]", error);
			if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
				throw error;
			}

			throw new Error(EMPLOYEE_ERRORS.DELETE_FAILED);
		}
	});

const restoreEmployeeFn = createServerFn({ method: "POST" })
	.inputValidator(employeeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			assertCanManageEmployees(getServerLoggedUserSession());
			const { firmId } = getServerEmployeeScope();

			return await restoreEmployee({ firmId, id: data.id });
		} catch (error) {
			console.error("[restoreEmployee]", error);
			if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
				throw error;
			}

			throw new Error(EMPLOYEE_ERRORS.RESTORE_FAILED);
		}
	});

export const createEmployeeMutationOptions = () =>
	mutationOptions({ mutationFn: createEmployeeFn });

export const updateEmployeeMutationOptions = () =>
	mutationOptions({ mutationFn: updateEmployeeFn });

export const deleteEmployeeMutationOptions = () =>
	mutationOptions({ mutationFn: deleteEmployeeFn });

export const restoreEmployeeMutationOptions = () =>
	mutationOptions({ mutationFn: restoreEmployeeFn });
