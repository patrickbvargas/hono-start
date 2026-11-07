import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { assertCan } from "@/shared/session";
import { authMiddleware } from "@/shared/session/server";
import { PAYABLE_ERRORS } from "../constants/errors";
import { PAYABLE_READ_PERMISSIONS } from "../constants/values";
import {
	getPayableById,
	getPayableOptions,
	getPayablePayments,
	getPayables,
} from "../data/queries";
import {
	type PayableSearch,
	payableIdInputSchema,
	payableSearchSchema,
} from "../schemas/search";
import { getPayableRefreshInterval } from "../utils/date";

export const payableKeys = {
	all: ["payable"] as const,
	list: (search: PayableSearch) =>
		["payable", "list", payableSearchSchema.parse(search)] as const,
	detail: (id: number) => ["payable", "detail", id] as const,
	options: () => ["payable", "options"] as const,
	payments: (id: number) => ["payable", "payments", id] as const,
};
const getPayablesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(payableSearchSchema)
	.handler(async ({ context, data }) => {
		assertCan(context.session, PAYABLE_READ_PERMISSIONS);
		try {
			return await getPayables(context.session, data);
		} catch (error) {
			console.error("[getPayables]", error);
			throw new Error(PAYABLE_ERRORS.GET_FAILED);
		}
	});
const getPayableByIdFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(payableIdInputSchema)
	.handler(async ({ context, data }) => {
		assertCan(context.session, PAYABLE_READ_PERMISSIONS);
		try {
			return await getPayableById(context.session, data.id);
		} catch (error) {
			console.error("[getPayableById]", error);
			throw new Error(PAYABLE_ERRORS.DETAIL_FAILED);
		}
	});
const getPayableOptionsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		assertCan(context.session, PAYABLE_READ_PERMISSIONS);
		try {
			return await getPayableOptions(context.session);
		} catch (error) {
			console.error("[getPayableOptions]", error);
			throw new Error(PAYABLE_ERRORS.OPTIONS_FAILED);
		}
	});
const getPayablePaymentsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(payableIdInputSchema)
	.handler(async ({ context, data }) => {
		assertCan(context.session, PAYABLE_READ_PERMISSIONS);
		try {
			const title = await getPayableById(context.session, data.id);
			assertCan(
				context.session,
				["org:payments:read_all", "org:payments:read_own"],
				{
					firmId: context.session.firm.id,
					beneficiaryPersonId: title.beneficiaryPersonId,
					isRemuneration: title.isRemuneration,
					contract: title.contractId
						? {
								firmId: context.session.firm.id,
								isAssignedToActor: title.isAssignedToActor,
							}
						: undefined,
				},
			);
			return await getPayablePayments(context.session, data.id);
		} catch (error) {
			console.error("[getPayablePayments]", error);
			throw new Error(PAYABLE_ERRORS.DETAIL_FAILED);
		}
	});
export const getPayablesQueryOptions = (search: PayableSearch) =>
	queryOptions({
		queryKey: payableKeys.list(search),
		queryFn: () => getPayablesFn({ data: search }),
		refetchInterval: () => getPayableRefreshInterval(),
		refetchOnWindowFocus: "always",
		meta: { refreshOnMutation: true },
	});
export const getPayableByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: payableKeys.detail(id),
		queryFn: () => getPayableByIdFn({ data: { id } }),
		refetchInterval: () => getPayableRefreshInterval(),
		refetchOnWindowFocus: "always",
		meta: { refreshOnMutation: true },
	});
export const getPayableOptionsQueryOptions = () =>
	queryOptions({
		queryKey: payableKeys.options(),
		queryFn: () => getPayableOptionsFn(),
		meta: { refreshOnMutation: true },
	});
export const getPayablePaymentsQueryOptions = (id: number) =>
	queryOptions({
		queryKey: payableKeys.payments(id),
		queryFn: () => getPayablePaymentsFn({ data: { id } }),
		meta: { refreshOnMutation: true },
	});
