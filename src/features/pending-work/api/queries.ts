import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { assertCan, hasPermission } from "@/shared/session";
import {
	authMiddleware,
	getRequiredServerLoggedUserSession,
	getServerScope,
} from "@/shared/session/server";
import { PENDING_WORK_ERRORS } from "../constants/errors";
import { getPendingWork } from "../data/queries";
import type { PendingWorkPage } from "../schemas/model";
import {
	type PendingWorkSearch,
	pendingWorkSearchSchema,
} from "../schemas/search";

export const pendingWorkKeys = {
	all: ["pending-work"] as const,
	list: (search: PendingWorkSearch) =>
		[...pendingWorkKeys.all, search] as const,
};

const getPendingWorkFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(pendingWorkSearchSchema)
	.handler(async ({ data }): Promise<PendingWorkPage> => {
		try {
			const session = await getRequiredServerLoggedUserSession();
			assertCan(session, [
				"org:contracts:read_all",
				"org:contracts:read_assigned",
			]);
			const scope = await getServerScope("contract");
			return await getPendingWork({
				search: data,
				scope: {
					firmId: scope.firmId,
					employeeId: session.employee.id ?? undefined,
					employeeTypeValue: session.employeeType?.value,
					allContracts: hasPermission(session, "org:contracts:read_all"),
					allFees: hasPermission(session, "org:fees:read_all"),
					assignedFees: hasPermission(session, "org:fees:read_assigned"),
				},
			});
		} catch (error) {
			console.error("[getPendingWork]", error);
			throw new Error(PENDING_WORK_ERRORS.GET_FAILED);
		}
	});

export const getPendingWorkQueryOptions = (search: PendingWorkSearch) =>
	queryOptions({
		queryKey: pendingWorkKeys.list(search),
		queryFn: () => getPendingWorkFn({ data: search }),
		meta: { refreshOnMutation: true },
	});
