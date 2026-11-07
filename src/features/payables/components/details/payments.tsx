import { CatchBoundary } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { Suspense } from "react";
import { SettlementReversalAction } from "@/features/title-settlements";
import { DataTable } from "@/shared/components/data-table";
import { Button, Skeleton } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import { usePayablePayments } from "../../hooks/use-data";
import type { PayablePayment } from "../../schemas/model";

interface PayablePaymentsProps {
	id: number;
}
const c = createColumnHelper<typeof dataTableFeatures, PayablePayment>();
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
						direction="payable"
						titleId={titleId}
						movementId={row.original.id}
					/>
				</div>
			),
	}),
];
export function PayablePayments({ id }: PayablePaymentsProps) {
	return (
		<CatchBoundary
			getResetKey={() => String(id)}
			errorComponent={({ reset }) => (
				<div role="alert" className="space-y-2">
					<p>Não foi possível carregar os pagamentos.</p>
					<Button type="button" variant="outline" size="sm" onClick={reset}>
						Tentar novamente
					</Button>
				</div>
			)}
		>
			<Suspense fallback={<Skeleton className="h-32 w-full" />}>
				<PayablePaymentsContent id={id} />
			</Suspense>
		</CatchBoundary>
	);
}
function PayablePaymentsContent({ id }: PayablePaymentsProps) {
	const { payments } = usePayablePayments(id);
	return (
		<DataTable
			data={payments}
			columns={getColumns(id)}
			emptyMessage="Nenhum pagamento registrado."
		/>
	);
}
