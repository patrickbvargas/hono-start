import type { ReactNode } from "react";
import { RelatedRecordLink } from "@/features/related-records";
import { DataCardList } from "@/shared/components/data-card-list";
import { Pagination } from "@/shared/components/pagination";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { formatter } from "@/shared/lib/formatter";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { usePendingWorkNavigation } from "../../hooks/use-navigation";
import type { PendingWorkPage } from "../../schemas/model";
import { PendingWorkContractSummary } from "../contract-summary";
import { PendingWorkDueDate } from "../due-date";
import { PendingWorkRecordActions } from "../record-actions";
import { PendingWorkSeverity } from "../severity";

interface PendingWorkListProps {
	emptyState?: ReactNode;
	data: PendingWorkPage;
}

export function PendingWorkList({ data, emptyState }: PendingWorkListProps) {
	const session = useLoggedUserSession();
	const { openFinance } = usePendingWorkNavigation();
	const { overlay } = useOverlay<number>();
	const canReadClient = hasPermission(session, "org:clients:read");
	return (
		<>
			<DataCardList
				emptyState={emptyState}
				data={data.data}
				getRowKey={(item) => item.id}
				renderTitle={(item) => item.title}
				onCardAction={(item) => void openFinance(item.contractId)}
				renderFields={(item) => [
					{
						term: "Contrato",
						classNames: { item: "col-span-2" },
						definition: (
							<button
								type="button"
								className="text-left break-all underline underline-offset-4"
								onClick={() => overlay.details.open(item.contractId)}
							>
								{item.processNumber}
							</button>
						),
					},
					{
						term: "Cliente",
						classNames: { item: "col-span-2" },
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
						<PendingWorkSeverity severity={item.severity} />
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
