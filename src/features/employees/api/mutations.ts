import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
import { assertCan, authMiddleware } from "@/shared/session";
import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type { MutationReturnType } from "@/shared/types/api";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import {
	createEmployee,
	deleteEmployee,
	grantEmployeeAccess,
	resetEmployeePassword,
	restoreEmployee,
	revokeEmployeeAccess,
	updateEmployee,
} from "../data/mutations";
import {
	employeeCreateInputSchema,
	employeeIdInputSchema,
	employeeUpdateInputSchema,
} from "../schemas/form";

const createEmployeeFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(employeeCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "employee.manage");
			const { firmId } = await getServerScope("employee");

			return await createEmployee({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				input: data,
			});
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
	.middleware([authMiddleware])
	.inputValidator(employeeUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "employee.manage");
			const { firmId } = await getServerScope("employee");

			return await updateEmployee({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				input: data,
			});
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
	.middleware([authMiddleware])
	.inputValidator(employeeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "employee.manage");
			const { firmId } = await getServerScope("employee");

			return await deleteEmployee({
				actor: {
					id: session.employee.id,
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
	.inputValidator(employeeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "employee.manage");
			const { firmId } = await getServerScope("employee");

			return await restoreEmployee({
				actor: {
					id: session.employee.id,
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

const resetEmployeePasswordFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(employeeIdInputSchema)
	.handler(
		async ({
			data,
		}): Promise<
			MutationReturnType & {
				temporaryPassword: string;
			}
		> => {
			try {
				const session = await getRequiredServerLoggedUserSession();
				assertCan(session, "employee.manage");
				const { firmId } = await getServerScope("employee");

				return await resetEmployeePassword({
					actor: {
						id: session.employee.id,
						name: session.user.fullName,
						email: session.user.email,
					},
					firmId,
					id: data.id,
				});
			} catch (error) {
				console.error("[resetEmployeePassword]", error);
				if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
					throw error;
				}

				throw new Error(EMPLOYEE_ERRORS.RESET_PASSWORD_FAILED);
			}
		},
	);

const grantEmployeeAccessFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(employeeIdInputSchema)
	.handler(
		async ({
			data,
		}): Promise<
			MutationReturnType & {
				temporaryPassword: string;
			}
		> => {
			try {
				const session = await getRequiredServerLoggedUserSession();
				assertCan(session, "employee.manage");
				const { firmId } = await getServerScope("employee");

				return await grantEmployeeAccess({
					actor: {
						id: session.employee.id,
						name: session.user.fullName,
						email: session.user.email,
					},
					firmId,
					id: data.id,
				});
			} catch (error) {
				console.error("[grantEmployeeAccess]", error);
				if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
					throw error;
				}

				throw new Error(EMPLOYEE_ERRORS.GRANT_ACCESS_FAILED);
			}
		},
	);

const revokeEmployeeAccessFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(employeeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "employee.manage");
			const { firmId } = await getServerScope("employee");

			return await revokeEmployeeAccess({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
			});
		} catch (error) {
			console.error("[revokeEmployeeAccess]", error);
			if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
				throw error;
			}

			throw new Error(EMPLOYEE_ERRORS.REVOKE_ACCESS_FAILED);
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

export const resetEmployeePasswordMutationOptions = () =>
	mutationOptions({ mutationFn: resetEmployeePasswordFn });

export const grantEmployeeAccessMutationOptions = () =>
	mutationOptions({ mutationFn: grantEmployeeAccessFn });

export const revokeEmployeeAccessMutationOptions = () =>
	mutationOptions({ mutationFn: revokeEmployeeAccessFn });
