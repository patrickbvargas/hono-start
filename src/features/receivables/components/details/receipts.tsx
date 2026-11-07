import { CatchBoundary } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { Suspense } from "react";
import { SettlementReversalAction } from "@/features/title-settlements";
import { DataTable } from "@/shared/components/data-table";
import { Button, Skeleton } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import { useReceivableReceipts } from "../../hooks/use-data";
import type { ReceivableReceipt } from "../../schemas/model";

interface ReceivableReceiptsProps {
	id: number;
}
const c = createColumnHelper<typeof dataTableFeatures, ReceivableReceipt>();
const getColumns = (titleId: number) => [
	c.accessor("effectiveDate", {
		header: "Data efetiva",
		cell: (context) => formatter.calendarDate(context.getValue()),
		enableSorting: false,
	}),
	c.accessor("actualMethod", { header: "Meio real", enableSorting: false }),
	...(
		[
			["principalAbated", "Principal"],
			["discount", "Desconto"],
			["interest", "Juros"],
			["penalty", "Multa"],
			["effectiveAmount", "Caixa efetivo"],
		] as const
	).map(([key, header]) =>
		c.accessor(key, {
			header,
			enableSorting: false,
			cell: (context) => (
				<SensitiveValue>
					{formatter.currency(context.getValue())}
				</SensitiveValue>
			),
		}),
	),
	c.display({
		id: "reversal",
		header: "Situação",
		cell: ({ row }) =>
			row.original.reversal ? (
				<span>
					Estornado em{" "}
					{formatter.calendarDate(row.original.reversal.effectiveDate)} •{" "}
					{row.original.reversal.reason}
				</span>
			) : (
				<div className="flex items-center gap-2">
					<span>Confirmado</span>
					<SettlementReversalAction
						direction="receivable"
						titleId={titleId}
						movementId={row.original.id}
					/>
				</div>
			),
	}),
];
export function ReceivableReceipts({ id }: ReceivableReceiptsProps) {
	return (
		<CatchBoundary
			getResetKey={() => String(id)}
			errorComponent={({ reset }) => (
				<div role="alert" className="space-y-2">
					<p>Não foi possível carregar os recebimentos.</p>
					<Button type="button" variant="outline" size="sm" onClick={reset}>
						Tentar novamente
					</Button>
				</div>
			)}
		>
			<Suspense fallback={<Skeleton className="h-32 w-full" />}>
				<ReceivableReceiptsContent id={id} />
			</Suspense>
		</CatchBoundary>
	);
}
function ReceivableReceiptsContent({ id }: ReceivableReceiptsProps) {
	const { receipts } = useReceivableReceipts(id);
	return (
		<DataTable
			data={receipts}
			columns={getColumns(id)}
			emptyMessage="Nenhum recebimento registrado."
		/>
	);
}
