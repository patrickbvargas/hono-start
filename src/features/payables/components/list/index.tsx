import type { ReactNode } from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import {
	PAYABLE_KINDS,
	PAYABLE_ORIGINS,
	PAYABLE_READ_PERMISSIONS,
} from "../../constants/values";
import type { PayablePage } from "../../schemas/model";
import { PayableStatus } from "../status";

interface PayableListProps {
	data: PayablePage;
	emptyState?: ReactNode;
	onOpenPage: (id: number) => void;
	onView: (id: number) => void;
}
export function PayableList({
	data,
	emptyState,
	onOpenPage,
	onView,
}: PayableListProps) {
	return (
		<DataCardList
			data={data.data}
			emptyState={emptyState}
			getRowKey={(row) => row.id}
			renderTitle={(row) => row.beneficiaryName}
			onCardAction={(row) => onOpenPage(row.id)}
			renderFields={(row) => [
				{ term: "Título", definition: `#${row.id}` },
				{ term: "Vencimento", definition: formatter.calendarDate(row.dueDate) },
				{ term: "Situação", definition: <PayableStatus payable={row} /> },
				{
					term: "Origem",
					definition: PAYABLE_ORIGINS.find((item) => item.value === row.origin)
						?.label,
				},
				{
					term: "Classificação",
					definition: PAYABLE_KINDS.find((item) => item.value === row.kind)
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
					viewPermission={PAYABLE_READ_PERMISSIONS}
					onOpenPage={() => onOpenPage(row.id)}
					onView={() => onView(row.id)}
				/>
			)}
			footerContent={<Pagination totalRecords={data.total} />}
		/>
	);
}
