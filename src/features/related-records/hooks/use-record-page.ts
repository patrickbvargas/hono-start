import { useNavigate, useSearch } from "@tanstack/react-router";
import type { EntityId } from "@/shared/schemas/entity";
import type { RelatedRecordKind } from "../schemas/record";

export function useRecordPage(kind: RelatedRecordKind, id: EntityId) {
	const navigate = useNavigate();
	const currentSearch = useSearch({ strict: false });
	const openPage = async () => {
		switch (kind) {
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
			case "fee": {
				const { feeSearchSchema } = await import("@/features/fees");
				return navigate({
					to: "/honorarios/$feeId",
					params: { feeId: String(id) },
					search: {
						tab: "overview",
						returnTo: feeSearchSchema.parse(currentSearch),
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
			case "remuneration": {
				const { remunerationSearchSchema } = await import(
					"@/features/remunerations"
				);
				return navigate({
					to: "/remuneracoes/$remunerationId",
					params: { remunerationId: String(id) },
					search: {
						tab: "overview",
						returnTo: remunerationSearchSchema.parse(currentSearch),
					},
				});
			}
		}
	};
	return { openPage };
}
