import { RelatedRecordLink } from "@/features/related-records";
import { DataCardList } from "@/shared/components/data-card-list";
import { Pagination } from "@/shared/components/pagination";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { formatter } from "@/shared/lib/formatter";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { PendingWorkPage } from "../../schemas/model";
import { PendingWorkAction } from "../action";
import { PendingWorkContractLink } from "../contract-link";
import { PendingWorkContractSummary } from "../contract-summary";
import { PendingWorkDueDate } from "../due-date";
import { PendingWorkRecordActions } from "../record-actions";
import { PendingWorkSeverity } from "../severity";

interface PendingWorkListProps {
	data: PendingWorkPage;
}

export function PendingWorkList({ data }: PendingWorkListProps) {
	const session = useLoggedUserSession();
	const { overlay } = useOverlay<number>();
	const canReadClient = hasPermission(session, "org:clients:read");
	return (
		<>
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
							item.remainingAmount === null ? (
								"—"
							) : (
								<SensitiveValue>
									{formatter.currency(item.remainingAmount)}
								</SensitiveValue>
							),
					},
				]}
				renderActions={(item) => (
					<div className="flex items-center gap-1">
						<PendingWorkAction item={item} />
						<PendingWorkRecordActions
							item={item}
							onView={overlay.details.open}
						/>
					</div>
				)}
				emptyMessage="Nenhuma pendência encontrada para os filtros selecionados."
				footerContent={<Pagination totalRecords={data.total} />}
			/>
			{overlay.details.render((id, state) => (
				<PendingWorkContractSummary id={id} state={state} />
			))}
		</>
	);
}
