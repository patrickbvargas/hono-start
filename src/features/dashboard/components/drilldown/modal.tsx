import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Drilldown } from "@/features/drilldown";
import { formatter } from "@/shared/lib/formatter";
import type { OverlayState } from "@/shared/types/overlay";
import {
	dashboardKeys,
	getDashboardDrilldownQueryOptions,
} from "../../api/queries";
import type { DashboardDrilldownTarget } from "../../hooks/use-drilldown";
import { dashboardDrilldownResultSchema } from "../../schemas/drilldown";
import type { DashboardSearch } from "../../schemas/search";
import { getDashboardDrilldownColumns } from "./columns";

interface DashboardDrilldownModalProps {
	target: DashboardDrilldownTarget;
	search: DashboardSearch;
	referenceAt: string;
	state: OverlayState;
	returnFocus: (() => HTMLElement | SVGElement | null) | null;
}

export function DashboardDrilldownModal({
	target,
	search,
	referenceAt,
	state,
	returnFocus,
}: DashboardDrilldownModalProps) {
	const columns = useMemo(
		() => getDashboardDrilldownColumns(target.selection),
		[target.selection],
	);
	return (
		<Drilldown
			state={state}
			returnFocus={returnFocus}
			title={target.title}
			description={`Período: ${search.dateFrom ? formatter.date(`${search.dateFrom}T00:00:00`) : "sem limite inicial"} a ${search.dateTo ? formatter.date(`${search.dateTo}T00:00:00`) : "sem limite final"}\nPosição: ${formatter.date(referenceAt)}`}
			context={{ selection: target.selection, referenceAt }}
			filters={search}
			columns={columns}
			initialSorting={[{ id: "date", desc: true }]}
			getRowId={(row) => row.id}
			responseSchema={dashboardDrilldownResultSchema}
			queryOptions={({ context, filters }) =>
				getDashboardDrilldownQueryOptions({
					...context,
					search: filters,
				})
			}
			renderSummary={(page) => (
				<DrilldownSummary amount={page.amount} target={target} />
			)}
		/>
	);
}

interface DrilldownSummaryProps {
	amount: number;
	target: DashboardDrilldownTarget;
}
function DrilldownSummary({ amount, target }: DrilldownSummaryProps) {
	const client = useQueryClient();
	const changed = Math.abs(amount - target.expectedAmount) > 0.005;
	useEffect(() => {
		if (changed) {
			void client.invalidateQueries({
				queryKey: [...dashboardKeys.all, "summary"],
			});
		}
	}, [changed, client]);
	return (
		<div className="space-y-1 text-sm">
			{changed ? (
				<p role="status" className="text-muted-foreground">
					Dados atualizados. Exibindo a composição atual.
				</p>
			) : null}
			<p className="font-medium">Total: {formatter.currency(amount)}</p>
		</div>
	);
}
