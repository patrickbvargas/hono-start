import type { QueryClient } from "@tanstack/react-query";
import { refreshAuditedEntityQueries } from "@/features/audit-logs";
import { contractKeys } from "@/features/contracts";
import { dashboardKeys } from "@/features/dashboard";
import { expenseKeys } from "@/features/expenses";
import { financialTitleKeys } from "@/features/financial-titles";
import { payableKeys } from "@/features/payables";
import { receivableKeys } from "@/features/receivables";

export async function refreshSettlementQueries(client: QueryClient) {
	await Promise.all([
		refreshAuditedEntityQueries(client, financialTitleKeys.all),
		...[
			receivableKeys.all,
			payableKeys.all,
			contractKeys.all,
			expenseKeys.all,
			dashboardKeys.all,
		].map((queryKey) => client.invalidateQueries({ queryKey })),
	]);
}
