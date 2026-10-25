import { useSearch } from "@tanstack/react-router";
import { pendingWorkSearchSchema } from "../schemas/search";

export function usePendingWorkNavigation() {
	const search = pendingWorkSearchSchema.parse(useSearch({ strict: false }));
	return {
		workspaceSearch: (tab: "overview" | "finance" | "team") => ({
			tab,
			pendingReturnTo: search,
		}),
	};
}
