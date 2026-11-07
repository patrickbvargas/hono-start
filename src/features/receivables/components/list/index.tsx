import type { ReactNode } from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import {
	RECEIVABLE_KINDS,
	RECEIVABLE_READ_PERMISSIONS,
} from "../../constants/values";
import type { ReceivablePage } from "../../schemas/model";
import { ReceivableStatus } from "../status";

interface ReceivableListProps {
	data: ReceivablePage;
	emptyState?: ReactNode;
	onOpenPage: (id: number) => void;
	onView: (id: number) => void;
}
export function ReceivableList({
	data,
	emptyState,
	onOpenPage,
	onView,
}: ReceivableListProps) {
	return (
		<DataCardList
			data={data.data}
			emptyState={emptyState}
			getRowKey={(row) => row.id}
			renderTitle={(row) => row.debtorName}
			onCardAction={(row) => onOpenPage(row.id)}
			renderFields={(row) => [
				{ term: "Título", definition: `#${row.id}` },
				{ term: "Vencimento", definition: formatter.calendarDate(row.dueDate) },
				{ term: "Situação", definition: <ReceivableStatus receivable={row} /> },
				{
					term: "Origem",
					definition: row.contractId
						? row.processNumber || `Contrato #${row.contractId}`
						: "Sem vínculo com contrato",
				},
				{
					term: "Classificação",
					definition: RECEIVABLE_KINDS.find((item) => item.value === row.kind)
						?.label,
				},
				{
					term: "Saldo",
					definition: (
						<SensitiveValue>{formatter.currency(row.balance)}</SensitiveValue>
					),
				},
				{
					term: "Valor nominal",
					definition: (
						<SensitiveValue>{formatter.currency(row.amount)}</SensitiveValue>
					),
				},
			]}
			renderActions={(row) => (
				<EntityActions
					viewPermission={RECEIVABLE_READ_PERMISSIONS}
					onOpenPage={() => onOpenPage(row.id)}
					onView={() => onView(row.id)}
				/>
			)}
			footerContent={<Pagination totalRecords={data.total} />}
		/>
	);
}
