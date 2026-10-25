import { RelatedRecordLink } from "@/features/related-records";
import { DataCardList } from "@/shared/components/data-card-list";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { PendingWorkPage } from "../../schemas/model";
import { PendingWorkAction } from "../action";
import { PendingWorkContractLink } from "../contract-link";
import { PendingWorkDueDate } from "../due-date";
import { PendingWorkSeverity } from "../severity";

interface PendingWorkListProps {
	data: PendingWorkPage;
}

export function PendingWorkList({ data }: PendingWorkListProps) {
	const session = useLoggedUserSession();
	const canReadClient = hasPermission(session, "org:clients:read");
	return (
		<DataCardList
			data={data.data}
			getRowKey={(item) => item.id}
			renderTitle={(item) => item.title}
			renderFields={(item) => [
				{
					term: "Criticidade",
					definition: <PendingWorkSeverity severity={item.severity} />,
				},
				{
					term: "Contrato",
					definition: <PendingWorkContractLink item={item} />,
				},
				{
					term: "Cliente",
					definition: canReadClient ? (
						<RelatedRecordLink kind="client" id={item.clientId}>
							{item.client}
						</RelatedRecordLink>
					) : (
						item.client
					),
				},
				{
					term: "Vencimento em aberto",
					definition: (
						<PendingWorkDueDate
							date={item.dueDate}
							overdueDays={item.overdueDays}
						/>
					),
				},
				{
					term: "Saldo a receber",
					definition:
						item.remainingAmount === null
							? "—"
							: formatter.currency(item.remainingAmount),
				},
			]}
			renderActions={(item) => <PendingWorkAction item={item} />}
			emptyMessage="Nenhuma pendência encontrada para os filtros selecionados."
			footerContent={<Pagination totalRecords={data.total} />}
		/>
	);
}
