import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { assertCan } from "@/shared/session";
import { authMiddleware } from "@/shared/session/middleware";
import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
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
	.middleware([authMiddleware])
	.validator(employeeCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:employees:create");
			const { firmId } = await getServerScope("employee");

			return await createEmployee({
				actor: {
					id: session.employee.id ?? undefined,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				input: data,
			});
		} catch (error) {
			console.error("[createEmployee]", error);

			if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
				throw error;
			}

			throw new Error(EMPLOYEE_ERRORS.CREATE_FAILED);
		}
	});

const updateEmployeeFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(employeeUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:employees:update");
			const { firmId } = await getServerScope("employee");

			return await updateEmployee({
				actor: {
					id: session.employee.id ?? undefined,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				input: data,
			});
		} catch (error) {
			console.error("[updateEmployee]", error);

			if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
				throw error;
			}

			throw new Error(EMPLOYEE_ERRORS.UPDATE_FAILED);
		}
	});

const deleteEmployeeFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(employeeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:employees:delete");
			const { firmId } = await getServerScope("employee");

			return await deleteEmployee({
				actor: {
					id: session.employee.id ?? undefined,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
			});
		} catch (error) {
			console.error("[deleteEmployee]", error);
			if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
				throw error;
			}

			throw new Error(EMPLOYEE_ERRORS.DELETE_FAILED);
		}
	});

const restoreEmployeeFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(employeeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:employees:restore");
			const { firmId } = await getServerScope("employee");

			return await restoreEmployee({
				actor: {
					id: session.employee.id ?? undefined,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
			});
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
