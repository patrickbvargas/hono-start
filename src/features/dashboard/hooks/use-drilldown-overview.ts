import { useMemo } from "react";
import type {
	DashboardDrilldownRow,
	DashboardDrilldownSelection,
} from "../schemas/drilldown";
import { drilldownOverviewSchema } from "../schemas/drilldown-overview";

interface UseDrilldownOverviewOptions {
	rows: DashboardDrilldownRow[];
	selection: DashboardDrilldownSelection;
}

export function buildDrilldownOverview({
	rows,
	selection,
}: UseDrilldownOverviewOptions) {
	const result =
		(selection.kind === "metric" && selection.value === "result") ||
		(selection.kind === "monthly" &&
			["result", "output"].includes(selection.series));
	const dimensions: {
		key: string;
		label: string;
		read: (row: DashboardDrilldownRow) => { key: string; label: string };
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
	if (result) {
		dimensions.push({
			key: "kind",
			label: "Movimento",
			read: (row) => ({ key: row.kind, label: row.kind }),
		});
	} else {
		add("client", "Cliente");
		add("type", "Tipo");
		add("employee", "Colaborador");
		add("assignment", "Função");
		add("category", "Categoria");
	}
	return drilldownOverviewSchema.parse(
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

export function useDrilldownOverview({
	rows,
	selection,
}: UseDrilldownOverviewOptions) {
	return useMemo(
		() => buildDrilldownOverview({ rows, selection }),
		[rows, selection],
	);
}
