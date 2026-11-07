import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { assertCan } from "@/shared/session";
import { authMiddleware } from "@/shared/session/server";
import { RECEIVABLE_ERRORS } from "../constants/errors";
import { RECEIVABLE_READ_PERMISSIONS } from "../constants/values";
import {
	getReceivableById,
	getReceivableOptions,
	getReceivableReceipts,
	getReceivables,
} from "../data/queries";
import {
	type ReceivableSearch,
	receivableIdInputSchema,
	receivableSearchSchema,
} from "../schemas/search";
import { getReceivableRefreshInterval } from "../utils/date";

export const receivableKeys = {
	all: ["receivable"] as const,
	list: (search: ReceivableSearch) =>
		["receivable", "list", receivableSearchSchema.parse(search)] as const,
	detail: (id: number) => ["receivable", "detail", id] as const,
	options: () => ["receivable", "options"] as const,
	receipts: (id: number) => ["receivable", "receipts", id] as const,
};
const getReceivablesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(receivableSearchSchema)
	.handler(async ({ context, data }) => {
		assertCan(context.session, RECEIVABLE_READ_PERMISSIONS);
		try {
			return await getReceivables(context.session, data);
		} catch (error) {
			console.error("[getReceivables]", error);
			throw new Error(RECEIVABLE_ERRORS.GET_FAILED);
		}
	});
const getReceivableByIdFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(receivableIdInputSchema)
	.handler(async ({ context, data }) => {
		assertCan(context.session, RECEIVABLE_READ_PERMISSIONS);
		try {
			return await getReceivableById(context.session, data.id);
		} catch (error) {
			console.error("[getReceivableById]", error);
			throw new Error(RECEIVABLE_ERRORS.DETAIL_FAILED);
		}
	});
const getReceivableOptionsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		assertCan(context.session, RECEIVABLE_READ_PERMISSIONS);
		try {
			return await getReceivableOptions(context.session);
		} catch (error) {
			console.error("[getReceivableOptions]", error);
			throw new Error(RECEIVABLE_ERRORS.OPTIONS_FAILED);
		}
	});
const getReceivableReceiptsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(receivableIdInputSchema)
	.handler(async ({ context, data }) => {
		assertCan(context.session, RECEIVABLE_READ_PERMISSIONS);
		try {
			const title = await getReceivableById(context.session, data.id);
			assertCan(
				context.session,
				["org:receipts:read_all", "org:receipts:read_assigned"],
				{
					firmId: context.session.firm.id,
					contract: title.contractId
						? {
								firmId: context.session.firm.id,
								isAssignedToActor: title.isAssignedToActor,
							}
						: undefined,
				},
			);
			return await getReceivableReceipts(context.session, data.id);
		} catch (error) {
			console.error("[getReceivableReceipts]", error);
			throw new Error(RECEIVABLE_ERRORS.DETAIL_FAILED);
		}
	});
export const getReceivablesQueryOptions = (search: ReceivableSearch) =>
	queryOptions({
		queryKey: receivableKeys.list(search),
		queryFn: () => getReceivablesFn({ data: search }),
		refetchInterval: () => getReceivableRefreshInterval(),
		refetchOnWindowFocus: "always",
		meta: { refreshOnMutation: true },
	});
export const getReceivableByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: receivableKeys.detail(id),
		queryFn: () => getReceivableByIdFn({ data: { id } }),
		refetchInterval: () => getReceivableRefreshInterval(),
		refetchOnWindowFocus: "always",
		meta: { refreshOnMutation: true },
	});
export const getReceivableOptionsQueryOptions = () =>
	queryOptions({
		queryKey: receivableKeys.options(),
		queryFn: () => getReceivableOptionsFn(),
		meta: { refreshOnMutation: true },
	});
export const getReceivableReceiptsQueryOptions = (id: number) =>
	queryOptions({
		queryKey: receivableKeys.receipts(id),
		queryFn: () => getReceivableReceiptsFn({ data: { id } }),
		meta: { refreshOnMutation: true },
	});
