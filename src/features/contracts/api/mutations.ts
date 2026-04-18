import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
	isAdminSession,
} from "@/shared/session";
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
	.inputValidator(contractCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "contract.create");
			const scope = getServerScope("contract");

			return await createContract({
				scope: { firmId: scope.firmId },
				input: data,
				isAdmin: isAdminSession(session),
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
	.inputValidator(contractUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const access = await getContractAccessResourceById(data.id);

			if (!access?.resource) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
			}

			assertCan(session, "contract.update", access.resource);
			const scope = getServerScope("contract");

			return await updateContract({
				scope: { firmId: scope.firmId },
				input: data,
				isAdmin: isAdminSession(session),
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
	.inputValidator(contractIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const access = await getContractAccessResourceById(data.id);

			if (!access?.resource) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
			}

			assertCan(session, "contract.delete", access.resource);
			const { firmId } = getServerScope("contract");

			return await deleteContract({ firmId, id: data.id });
		} catch (error) {
			console.error("[deleteContract]", error);
			if (hasExactErrorMessage(error, CONTRACT_ERRORS)) {
				throw error;
			}

			throw new Error(CONTRACT_ERRORS.CONTRACT_DELETE_FAILED);
		}
	});

const restoreContractFn = createServerFn({ method: "POST" })
	.inputValidator(contractIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const access = await getContractAccessResourceById(data.id);

			if (!access?.resource) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
			}

			assertCan(session, "contract.restore", access.resource);
			const { firmId } = getServerScope("contract");

			return await restoreContract({ firmId, id: data.id });
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
