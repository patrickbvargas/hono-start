import { useMemo } from "react";
import type {
	FinancialDrilldownRow,
	FinancialDrilldownSelection,
} from "../schemas/drilldown";
import { financialDrilldownOverviewSchema } from "../schemas/drilldown-overview";

interface UseFinancialDrilldownOverviewOptions {
	rows: FinancialDrilldownRow[];
	selection: FinancialDrilldownSelection;
}

export function buildFinancialDrilldownOverview({
	rows,
	selection,
}: UseFinancialDrilldownOverviewOptions) {
	const isBalance =
		(selection.kind === "metric" &&
			(selection.value === "realized_balance" ||
				selection.value === "projected_balance")) ||
		(selection.kind === "monthly" &&
			(selection.series === "balanceRealized" ||
				selection.series === "balanceTotal"));

	const dimensions: {
		key: string;
		label: string;
		read: (row: FinancialDrilldownRow) => { key: string; label: string };
	}[] = [];

	const add = (
		key: "client" | "employee" | "type" | "assignment" | "category",
		label: string,
	) => {
		if (!rows.some((row) => row[key])) {
			return;
		}
		dimensions.push({
			key,
			label,
			read: (row) => {
				const identity =
					key === "client"
						? row.clientId
						: key === "employee"
							? row.employeeId
							: row[`${key}Value`];
				return {
					key: String(identity ?? (row[key] ? row.id : "missing")),
					label: row[key] ?? "Não informado",
				};
			},
		});
	};

	if (isBalance) {
		dimensions.push({
			key: "kind",
			label: "Movimento",
			read: (row) => ({ key: row.kind, label: row.kind }),
		});
		add("category", "Analítica");
		add("type", "Tipo");
		add("client", "Cliente / Devedor");
	} else {
		add("category", "Analítica");
		add("type", "Tipo");
		add("client", "Cliente / Devedor");
		add("employee", "Colaborador");
		add("assignment", "Função");
	}

	return financialDrilldownOverviewSchema.parse(
		dimensions.map((dimension) => {
			const groups = new Map<
				string,
				{ key: string; label: string; amount: number }
			>();
			for (const row of rows) {
				const group = dimension.read(row);
				const existing = groups.get(group.key) ?? { ...group, amount: 0 };
				existing.amount += Math.round(row.amount * 100);
				groups.set(group.key, existing);
			}
			return {
				key: dimension.key,
				label: dimension.label,
				groups: [...groups.values()]
					.sort(
						(a, b) =>
							Math.abs(b.amount) - Math.abs(a.amount) ||
							a.label.localeCompare(b.label, "pt-BR") ||
							a.key.localeCompare(b.key),
					)
					.map((group) => ({ ...group, amount: group.amount / 100 })),
			};
		}),
	);
}

export function useFinancialDrilldownOverview({
	rows,
	selection,
}: UseFinancialDrilldownOverviewOptions) {
	return useMemo(
		() => buildFinancialDrilldownOverview({ rows, selection }),
		[rows, selection],
	);
}
