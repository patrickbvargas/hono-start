import { useNavigate, useSearch } from "@tanstack/react-router";
import type { EntityId } from "@/shared/schemas/entity";
import type { RelatedRecordKind } from "../schemas/record";

export function useRecordPage(kind: RelatedRecordKind, id: EntityId) {
	const navigate = useNavigate();
	const currentSearch = useSearch({ strict: false });
	const openPage = async () => {
		switch (kind) {
			case "client": {
				const { clientSearchSchema } = await import("@/features/clients");
				return navigate({
					to: "/clientes/$clientId",
					params: { clientId: String(id) },
					search: {
						tab: "overview",
						returnTo: clientSearchSchema.parse(currentSearch),
					},
				});
			}
			case "employee": {
				const { employeeSearchSchema } = await import("@/features/employees");
				return navigate({
					to: "/colaboradores/$employeeId",
					params: { employeeId: String(id) },
					search: {
						tab: "overview",
						returnTo: employeeSearchSchema.parse(currentSearch),
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
