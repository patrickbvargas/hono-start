import { ScrollArea } from "@/shared/components/ui";
import type { DashboardSummary } from "../../schemas/model";
import { DashboardBreakdownChart } from "../breakdown-chart";
import { FinancialEvolutionChart } from "../financial-evolution";
import { DashboardMetricCards } from "../metric-cards";
import { DashboardRemunerationTable } from "../remuneration-table";

interface DashboardProps {
	data: DashboardSummary;
}

export function Dashboard({ data }: DashboardProps) {
	return (
		<ScrollArea hideScrollbar className="h-full min-h-0 flex flex-col gap-4">
			<div className="flex flex-col gap-4 p-0.5 pb-4">
				<DashboardMetricCards metrics={data.metrics} />
				<FinancialEvolutionChart
					description={data.financialEvolutionLabel}
					items={data.financialEvolution}
				/>
				<DashboardRemunerationTable
					months={data.remunerationMonths}
					rows={data.remunerationTable}
					subtotal={data.remunerationSubtotal}
				/>
				<div className="grid gap-3 xl:grid-cols-2">
					<DashboardBreakdownChart
						title="Receita por área"
						items={data.legalAreaRevenue}
						emptyLabel="Nenhuma receita recebida por área."
						variant="bar"
					/>
					<DashboardBreakdownChart
						title="Receita por tipo"
						items={data.revenueTypeRevenue}
						emptyLabel="Nenhuma receita recebida por tipo."
						variant="donut"
					/>
				</div>
			</div>
		</ScrollArea>
	);
}
