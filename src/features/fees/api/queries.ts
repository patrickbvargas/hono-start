import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import type { Option } from "@/shared/schemas/option";
import {
	getServerLoggedUserSession,
	getServerScope,
	isAdminSession,
} from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { FEE_DATA_CACHE_KEY } from "../constants/cache";
import { FEE_ERRORS } from "../constants/errors";
import {
	getFeeById,
	getFees,
	getSelectableFeeContracts,
	getSelectableFeeRevenues,
} from "../data/queries";
import { feeIdInputSchema } from "../schemas/form";
import type { FeeDetail, FeeSummary } from "../schemas/model";
import { type FeeSearch, feeSearchSchema } from "../schemas/search";

const getFeesFn = createServerFn({ method: "GET" })
	.inputValidator(feeSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<FeeSummary>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("fee");

			return await getFees({
				scope: {
					firmId: scope.firmId,
					employeeId: scope.employeeId,
					isAdmin: isAdminSession(session),
				},
				search: data,
			});
		} catch (error) {
			console.error("[getFees]", error);
			throw new Error(FEE_ERRORS.FEE_GET_FAILED);
		}
	});

const getFeeByIdFn = createServerFn({ method: "GET" })
	.inputValidator(feeIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<FeeDetail>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("fee");

			return await getFeeById({
				scope: {
					firmId: scope.firmId,
					employeeId: scope.employeeId,
					isAdmin: isAdminSession(session),
				},
				id: data.id,
			});
		} catch (error) {
			console.error("[getFeeById]", error);
			if (hasExactErrorMessage(error, FEE_ERRORS)) {
				throw error;
			}

			throw new Error(FEE_ERRORS.FEE_DETAIL_FAILED);
		}
	});

const getSelectableFeeContractsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("fee");

			return await getSelectableFeeContracts({
				firmId: scope.firmId,
				employeeId: scope.employeeId,
				isAdmin: isAdminSession(session),
			});
		} catch (error) {
			console.error("[getSelectableFeeContracts]", error);
			throw new Error(FEE_ERRORS.FEE_SELECTABLE_CONTRACTS_FAILED);
		}
	},
);

const getSelectableFeeRevenuesFn = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			contractId: z.string().catch("").default(""),
		}),
	)
	.handler(async ({ data }): Promise<QueryManyReturnType<Option>> => {
		try {
			const session = getServerLoggedUserSession();
			const scope = getServerScope("fee");

			return await getSelectableFeeRevenues({
				scope: {
					firmId: scope.firmId,
					employeeId: scope.employeeId,
					isAdmin: isAdminSession(session),
				},
				contractId: data.contractId,
			});
		} catch (error) {
			console.error("[getSelectableFeeRevenues]", error);
			throw new Error(FEE_ERRORS.FEE_SELECTABLE_REVENUES_FAILED);
		}
	});

export const getFeesQueryOptions = (search: FeeSearch) =>
	queryOptions({
		queryKey: [FEE_DATA_CACHE_KEY, search],
		queryFn: () => getFeesFn({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getFeeByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: [FEE_DATA_CACHE_KEY, "detail", id],
		queryFn: () => getFeeByIdFn({ data: { id } }),
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableFeeContractsQueryOptions = () =>
	queryOptions({
		queryKey: [FEE_DATA_CACHE_KEY, "contract-options"],
		queryFn: getSelectableFeeContractsFn,
		staleTime: 5 * 60 * 1000,
	});

export const getSelectableFeeRevenuesQueryOptions = (contractId = "") =>
	queryOptions({
		queryKey: [FEE_DATA_CACHE_KEY, "revenue-options", contractId],
		queryFn: () => getSelectableFeeRevenuesFn({ data: { contractId } }),
		staleTime: 5 * 60 * 1000,
	});
