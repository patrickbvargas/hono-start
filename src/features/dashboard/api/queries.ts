import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	getCurrentEmployeeId,
	getCurrentFirmId,
	getServerLoggedUserSession,
	isAdminSession,
} from "@/shared/session";
import type { QueryOneReturnType } from "@/shared/types/api";
import { DASHBOARD_DATA_CACHE_KEY } from "../constants/cache";
import { DASHBOARD_ERRORS } from "../constants/errors";
import { getDashboardSummary } from "../data/queries";
import type { DashboardSummary } from "../schemas/model";

const getDashboardSummaryFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryOneReturnType<DashboardSummary>> => {
		try {
			const session = getServerLoggedUserSession();
			const isAdmin = isAdminSession(session);

			return await getDashboardSummary({
				firmId: getCurrentFirmId(session),
				employeeId: isAdmin ? undefined : getCurrentEmployeeId(session),
				isAdmin,
			});
		} catch (error) {
			console.error("[getDashboardSummary]", error);
			throw new Error(DASHBOARD_ERRORS.GET_FAILED);
		}
	},
);

export const getDashboardSummaryQueryOptions = () =>
	queryOptions({
		queryKey: [DASHBOARD_DATA_CACHE_KEY, "summary"],
		queryFn: getDashboardSummaryFn,
		staleTime: 5 * 60 * 1000,
	});
