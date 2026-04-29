import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { assertCan, authMiddleware } from "@/shared/session";
import {
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import type { MutationReturnType } from "@/shared/types/api";
import { FEE_ERRORS } from "../constants/errors";
import { createFee, deleteFee, restoreFee, updateFee } from "../data/mutations";
import {
	getFeeAccessResourceById,
	getFeeRevenueAccessResourceById,
} from "../data/queries";
import {
	feeCreateInputSchema,
	feeIdInputSchema,
	feeUpdateInputSchema,
} from "../schemas/form";
import { normalizeFeeReference } from "../utils/normalization";

const createFeeFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(feeCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("fee");
			const revenueId = Number(normalizeFeeReference(data.revenueId));
			const access = await getFeeRevenueAccessResourceById(firmId, revenueId);

			if (!access) {
				throw new Error(FEE_ERRORS.FEE_SELECT_REVENUE);
			}

			assertCan(session, "fee.create", access.resource);

			return await createFee({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				scope: { firmId },
				input: data,
			});
		} catch (error) {
			console.error("[createFee]", error);
			if (hasExactErrorMessage(error, FEE_ERRORS)) {
				throw error;
			}

			throw new Error(FEE_ERRORS.FEE_CREATE_FAILED);
		}
	});

const updateFeeFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(feeUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("fee");
			const access = await getFeeAccessResourceById(firmId, data.id);

			if (!access) {
				throw new Error(FEE_ERRORS.FEE_NOT_FOUND);
			}

			assertCan(session, "fee.update", access.resource);

			const revenueId = Number(normalizeFeeReference(data.revenueId));
			const nextRevenueAccess = await getFeeRevenueAccessResourceById(
				firmId,
				revenueId,
			);

			if (!nextRevenueAccess) {
				throw new Error(FEE_ERRORS.FEE_SELECT_REVENUE);
			}

			assertCan(session, "fee.update", nextRevenueAccess.resource);

			return await updateFee({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				scope: { firmId },
				input: data,
				access,
			});
		} catch (error) {
			console.error("[updateFee]", error);
			if (hasExactErrorMessage(error, FEE_ERRORS)) {
				throw error;
			}

			throw new Error(FEE_ERRORS.FEE_UPDATE_FAILED);
		}
	});

const deleteFeeFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(feeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("fee");
			const access = await getFeeAccessResourceById(firmId, data.id);

			if (!access) {
				throw new Error(FEE_ERRORS.FEE_NOT_FOUND);
			}

			assertCan(session, "fee.delete", access.resource);

			return await deleteFee({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
				contractId: access.contractId,
			});
		} catch (error) {
			console.error("[deleteFee]", error);
			if (hasExactErrorMessage(error, FEE_ERRORS)) {
				throw error;
			}

			throw new Error(FEE_ERRORS.FEE_DELETE_FAILED);
		}
	});

const restoreFeeFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(feeIdInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			const { firmId } = await getServerScope("fee");
			const access = await getFeeAccessResourceById(firmId, data.id);

			if (!access) {
				throw new Error(FEE_ERRORS.FEE_NOT_FOUND);
			}

			assertCan(session, "fee.restore", access.resource);

			return await restoreFee({
				actor: {
					id: session.employee.id,
					name: session.user.fullName,
					email: session.user.email,
				},
				firmId,
				id: data.id,
				contractId: access.contractId,
			});
		} catch (error) {
			console.error("[restoreFee]", error);
			if (hasExactErrorMessage(error, FEE_ERRORS)) {
				throw error;
			}

			throw new Error(FEE_ERRORS.FEE_RESTORE_FAILED);
		}
	});

export const createFeeMutationOptions = () =>
	mutationOptions({
		mutationFn: createFeeFn,
	});

export const updateFeeMutationOptions = () =>
	mutationOptions({
		mutationFn: updateFeeFn,
	});

export const deleteFeeMutationOptions = () =>
	mutationOptions({
		mutationFn: deleteFeeFn,
	});

export const restoreFeeMutationOptions = () =>
	mutationOptions({
		mutationFn: restoreFeeFn,
	});
