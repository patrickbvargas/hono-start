import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
	getSelectableContractClientsQueryOptions,
	getSelectableContractEmployeesQueryOptions,
} from "@/features/contracts";
import { getPendingWorkQueryOptions } from "../api/queries";
import type { PendingWorkSearch } from "../schemas/search";

export function usePendingWork(search: PendingWorkSearch) {
	const { data: pendingWork } = useSuspenseQuery(
		getPendingWorkQueryOptions(search),
	);
	return { pendingWork };
}

export function usePendingWorkOptions() {
	const [{ data: clients }, { data: employees }] = useSuspenseQueries({
		queries: [
			getSelectableContractClientsQueryOptions(),
			getSelectableContractEmployeesQueryOptions(),
		],
	});
	return { clients, employees };
}
