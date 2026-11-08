import { useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo } from "react";
import { Drilldown } from "@/features/drilldown";
import { RelatedRecordActions } from "@/features/related-records";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { formatter } from "@/shared/lib/formatter";
import type { OverlayState } from "@/shared/types/overlay";
import {
	financialOverviewKeys,
	getFinancialOverviewDrilldownQueryOptions,
} from "../../api/queries";
import type { FinancialDrilldownTarget } from "../../hooks/use-drilldown";
import type { FinancialRecordTarget } from "../../schemas/drilldown";
import { financialDrilldownResultSchema } from "../../schemas/drilldown";
import type { FinancialOverviewSearch } from "../../schemas/search";
import { getFinancialDrilldownColumns } from "./columns";
import { FinancialDrilldownOverview } from "./overview";

const FinancialRecordSummary = lazy(() =>
	import("./summary").then((module) => ({
		default: module.FinancialRecordSummary,
	})),
);

interface FinancialDrilldownModalProps {
	target: FinancialDrilldownTarget;
	search: FinancialOverviewSearch;
	referenceAt: string;
	state: OverlayState;
	returnFocus: (() => HTMLElement | SVGElement | null) | null;
}

export function FinancialDrilldownModal({
	target,
	search,
	referenceAt,
	state,
	returnFocus,
}: FinancialDrilldownModalProps) {
	const { overlay } = useOverlay<FinancialRecordTarget>();
	const columns = useMemo(
		() => getFinancialDrilldownColumns(target.selection),
		[target.selection],
	);

	return (
		<Drilldown
			state={state}
			detailOpen={overlay.details.isOpen}
			onRowAction={(row) => overlay.details.open(row.record)}
			rowActionLabel="Ver resumo do registro"
			renderRowContextMenu={(row) => (
				<RelatedRecordActions
					kind={row.record.kind}
					id={row.record.id}
					presentation="context"
					onView={() => overlay.details.open(row.record)}
				/>
			)}
			returnFocus={returnFocus}
			title={target.title}
			description={`Período: ${search.dateFrom ? formatter.date(`${search.dateFrom}T00:00:00`) : "sem limite inicial"} a ${search.dateTo ? formatter.date(`${search.dateTo}T00:00:00`) : "sem limite final"}\nPosição: ${formatter.date(referenceAt)}`}
			context={{ selection: target.selection, referenceAt }}
			filters={search}
			columns={[
				...columns,
				{
					id: "actions",
					header: "",
					enableSorting: false,
					meta: { headerClassName: "w-10", cellClassName: "text-right" },
					cell: ({ row }) => (
						<RelatedRecordActions
							kind={row.original.record.kind}
							id={row.original.record.id}
							onView={() => overlay.details.open(row.original.record)}
						/>
					),
				},
			]}
			initialSorting={[{ id: "date", desc: true }]}
			getRowId={(row) => row.id}
			responseSchema={financialDrilldownResultSchema}
			queryOptions={({ context, filters }) =>
				getFinancialOverviewDrilldownQueryOptions({
					...context,
					search: filters,
				})
			}
			renderSummary={(page) => (
				<DrilldownSummary amount={page.amount} target={target} />
			)}
			renderOverview={(page) => (
				<FinancialDrilldownOverview
					rows={page.data}
					selection={target.selection}
				/>
			)}
			overviewSkeletonBlocks={2}
		>
			{overlay.details.render((record, summaryState) => (
				<Suspense fallback={null}>
					<FinancialRecordSummary record={record} state={summaryState} />
				</Suspense>
			))}
		</Drilldown>
	);
}

interface DrilldownSummaryProps {
	amount: number;
	target: FinancialDrilldownTarget;
}

function DrilldownSummary({ amount, target }: DrilldownSummaryProps) {
	const client = useQueryClient();
	const changed = Math.abs(amount - target.expectedAmount) > 0.005;
	useEffect(() => {
		if (changed) {
			void client.invalidateQueries({
				queryKey: [...financialOverviewKeys.all, "summary"],
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
			<p className="font-medium">
				Total: <SensitiveValue>{formatter.currency(amount)}</SensitiveValue>
			</p>
		</div>
	);
}
