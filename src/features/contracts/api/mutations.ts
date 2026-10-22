import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
import { assertCan, hasPermission } from "@/shared/session";
import { authMiddleware } from "@/shared/session/middleware";
import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type { MutationReturnType } from "@/shared/types/api";
import { CONTRACT_ERRORS } from "../constants/errors";
import {
	createContract,
	deleteContract,
	restoreContract,
	updateContract,
} from "../data/mutations";
import { getContractAccessResourceById } from "../data/queries";
import {
	contractCreateInputSchema,
	contractIdInputSchema,
	contractUpdateInputSchema,
} from "../schemas/form";

const createContractFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(contractCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, "org:contracts:create");
			const scope = await getServerScope("contract");

			return await createContract({
				actor: {
					id: session.employee.id ?? undefined,
					name: session.user.fullName,
					email: session.user.email,
				},
				scope: { firmId: scope.firmId },
				input: data,
				isAdmin: hasPermission(session, "org:contracts:update_all"),
			});
		} catch (error) {
			console.error("[createContract]", error);
			if (isPrismaUniqueConstraintError(error, ["firmId", "processNumber"])) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_PROCESS_NUMBER_DUPLICATE);
			}

			if (hasExactErrorMessage(error, CONTRACT_ERRORS)) {
				throw error;
			}

			throw new Error(CONTRACT_ERRORS.CONTRACT_CREATE_FAILED);
		}
	});

const updateContractFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(contractUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const access = await getContractAccessResourceById(data.id);

			if (!access?.resource) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
			}

			assertCan(
				session,
				["org:contracts:update_all", "org:contracts:update_assigned"],
				access.resource,
			);
			const scope = await getServerScope("contract");

			return await updateContract({
				actor: {
					id: session.employee.id ?? undefined,
					name: session.user.fullName,
					email: session.user.email,
				},
				scope: { firmId: scope.firmId },
				input: data,
				isAdmin: hasPermission(session, "org:contracts:update_all"),
			});
		} catch (error) {
			console.error("[updateContract]", error);
			if (isPrismaUniqueConstraintError(error, ["firmId", "processNumber"])) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_PROCESS_NUMBER_DUPLICATE);
			}

			if (hasExactErrorMessage(error, CONTRACT_ERRORS)) {
				throw error;
			}

			throw new Error(CONTRACT_ERRORS.CONTRACT_UPDATE_FAILED);
		}
	});

const deleteContractFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(contractIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const access = await getContractAccessResourceById(data.id);

			if (!access?.resource) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
			}

			assertCan(session, "org:contracts:delete", access.resource);
			const { firmId } = await getServerScope("contract");

			return await deleteContract({
				actor: {
					id: session.employee.id ?? undefined,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
			});
		} catch (error) {
			console.error("[deleteContract]", error);
			if (hasExactErrorMessage(error, CONTRACT_ERRORS)) {
				throw error;
			}

			throw new Error(CONTRACT_ERRORS.CONTRACT_DELETE_FAILED);
		}
	});

const restoreContractFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(contractIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const access = await getContractAccessResourceById(data.id);

			if (!access?.resource) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
			}

			assertCan(session, "org:contracts:restore", access.resource);
			const { firmId } = await getServerScope("contract");

			return await restoreContract({
				actor: {
					id: session.employee.id ?? undefined,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
			});
		} catch (error) {
			console.error("[restoreContract]", error);
			if (hasExactErrorMessage(error, CONTRACT_ERRORS)) {
				throw error;
			}

			throw new Error(CONTRACT_ERRORS.CONTRACT_RESTORE_FAILED);
		}
	});

export const createContractMutationOptions = () =>
	mutationOptions({
		mutationFn: createContractFn,
	});

export const updateContractMutationOptions = () =>
	mutationOptions({
		mutationFn: updateContractFn,
	});

export const deleteContractMutationOptions = () =>
	mutationOptions({
		mutationFn: deleteContractFn,
	});

export const restoreContractMutationOptions = () =>
	mutationOptions({
		mutationFn: restoreContractFn,
	});
