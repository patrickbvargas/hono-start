import type { ChartConfig } from "@/shared/components/ui";

export const CASH_FLOW_CHART_CONFIG = {
	balance: {
		label: "Saldo",
		color: "var(--primary)",
	},
} satisfies ChartConfig;

export const FINANCIAL_EVOLUTION_CHART_CONFIG = {
	expense: { label: "Saídas", color: "var(--chart-3)" },
	result: { label: "Resultado", color: "var(--foreground)" },
	revenue: {
		label: "Entradas",
		color: "var(--primary)",
	},
	remuneration: {
		label: "Remuneração",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export const BREAKDOWN_BAR_CHART_CONFIG = {
	total: {
		label: "Receita",
		color: "var(--primary)",
	},
} satisfies ChartConfig;
