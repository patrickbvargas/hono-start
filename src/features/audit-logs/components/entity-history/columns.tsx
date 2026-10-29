import { createColumnHelper } from "@tanstack/react-table";
import type { dataTableFeatures } from "@/shared/lib/table";
import { AUDIT_ACTION_LABELS } from "../../constants/display";
import type { AuditLog } from "../../schemas/model";

export function getEntityAuditHistoryTableColumns() {
	const c = createColumnHelper<typeof dataTableFeatures, AuditLog>();
	return [
		c.accessor("id", {
			header: "#",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="font-mono text-muted-foreground">
					#{row.original.id}
				</span>
			),
			meta: { headerClassName: "w-18", cellClassName: "whitespace-nowrap" },
		}),
		c.accessor("occurredAtLabel", {
			header: "Ocorrido em",
			enableSorting: false,
		}),
		c.accessor("action", {
			header: "Ação",
			enableSorting: false,
			cell: (context) =>
				AUDIT_ACTION_LABELS[context.getValue()] ?? context.getValue(),
		}),
		c.accessor("actorName", {
			header: "Usuário",
			enableSorting: false,
			cell: (context) => context.getValue() || "Sistema",
		}),
		c.accessor("description", {
			header: "Detalhes",
			enableSorting: false,
			cell: (context) => context.getValue() || "Ver resumo",
		}),
	];
}
