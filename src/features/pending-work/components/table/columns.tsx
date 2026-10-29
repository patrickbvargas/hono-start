import { createColumnHelper } from "@tanstack/react-table";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type { EntityId } from "@/shared/schemas/entity";
import type { PendingWork } from "../../schemas/model";
import { PendingWorkRecordActions } from "../record-actions";
import { PendingWorkSeverity } from "../severity";

export function getPendingWorkTableColumns(onView: (id: EntityId) => void) {
	const c = createColumnHelper<typeof dataTableFeatures, PendingWork>();
	return [
		c.accessor("severity", {
			header: "Criticidade",
			enableSorting: true,
			cell: ({ getValue }) => <PendingWorkSeverity severity={getValue()} />,
		}),
		c.accessor("title", {
			header: "Pendência",
			enableSorting: true,
			meta: { cellClassName: "max-w-56 whitespace-normal" },
		}),
		c.accessor("processNumber", {
			header: "Contrato",
			enableSorting: true,
		}),
		c.accessor("client", {
			header: "Cliente",
			meta: { cellClassName: "max-w-48 whitespace-normal" },
			enableSorting: true,
		}),
		c.accessor("dueDate", {
			header: "Vencimento",
			enableSorting: true,
			cell: ({ getValue }) => {
				const date = getValue();
				return date ? formatter.calendarDate(date) : "—";
			},
			meta: { cellClassName: "whitespace-nowrap" },
		}),
		c.accessor("remainingAmount", {
			header: "Saldo a receber",
			enableSorting: true,
			cell: ({ getValue }) => {
				const value = getValue();
				return value === null ? (
					"—"
				) : (
					<SensitiveValue>{formatter.currency(value)}</SensitiveValue>
				);
			},
			meta: { cellClassName: "whitespace-nowrap tabular-nums" },
		}),
		c.display({
			id: "actions",
			header: "",
			enableSorting: false,
			meta: { headerClassName: "w-10", cellClassName: "text-right" },
			cell: ({ row }) => (
				<PendingWorkRecordActions item={row.original} onView={onView} />
			),
		}),
	];
}
