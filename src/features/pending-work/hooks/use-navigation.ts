import { useNavigate, useSearch } from "@tanstack/react-router";
import { pendingWorkSearchSchema } from "../schemas/search";

export function usePendingWorkNavigation() {
	const navigate = useNavigate();
	const search = pendingWorkSearchSchema.parse(useSearch({ strict: false }));
	return {
		openFinance: (contractId: number) =>
			navigate({
				to: "/contratos/$contractId",
				params: { contractId: String(contractId) },
				search: { tab: "finance", pendingReturnTo: search },
			}),
		workspaceSearch: (tab: "overview" | "finance" | "team") => ({
			tab,
			pendingReturnTo: search,
		}),
	};
}
