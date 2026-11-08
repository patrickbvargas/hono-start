import { useNavigate, useSearch } from "@tanstack/react-router";
import type { EntityId } from "@/shared/schemas/entity";
import type { RelatedRecordKind } from "../schemas/record";

export function useRecordPage(kind: RelatedRecordKind, id: EntityId) {
	const navigate = useNavigate();
	const currentSearch = useSearch({ strict: false });
	const openPage = async () => {
		switch (kind) {
			case "payable": {
				const { payableSearchSchema } = await import("@/features/payables");
				return navigate({
					to: "/contas-a-pagar/$payableId",
					params: { payableId: String(id) },
					search: {
						tab: "overview",
						returnTo: payableSearchSchema.parse(currentSearch),
					},
				});
			}
			case "receivable": {
				const { receivableSearchSchema } = await import(
					"@/features/receivables"
				);
				return navigate({
					to: "/contas-a-receber/$receivableId",
					params: { receivableId: String(id) },
					search: {
						tab: "overview",
						returnTo: receivableSearchSchema.parse(currentSearch),
					},
				});
			}
			case "client":
			case "employee": {
				const { personSearchSchema } = await import("@/features/people");
				return navigate({
					to: "/pessoas/$personId",
					params: { personId: String(id) },
					search: {
						tab: "overview",
						returnTo: personSearchSchema.parse(currentSearch),
					},
				});
			}
			case "contract": {
				const { contractSearchSchema } = await import("@/features/contracts");
				return navigate({
					to: "/contratos/$contractId",
					params: { contractId: String(id) },
					search: {
						tab: "overview",
						returnTo: contractSearchSchema.parse(currentSearch),
					},
				});
			}
			case "expense": {
				const { expenseSearchSchema } = await import("@/features/expenses");
				return navigate({
					to: "/despesas/$expenseId",
					params: { expenseId: String(id) },
					search: {
						tab: "overview",
						returnTo: expenseSearchSchema.parse(currentSearch),
					},
				});
			}
		}
	};
	return { openPage };
}
