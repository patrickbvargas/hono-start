import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { RelatedRecordLink } from "@/features/related-records";
import { TitleSettlementAction } from "@/features/title-settlements";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { FormSection } from "@/shared/components/form-section";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import { RECEIVABLE_KINDS } from "../../constants/values";
import { useReceivableWorkspace } from "../../hooks/use-workspace";
import { ReceivableStatus } from "../status";
import { ReceivableReceipts } from "./receipts";

interface ReceivableOverviewProps {
	id: number;
	section?: "all" | "overview";
}
export function ReceivableOverview({
	id,
	section = "all",
}: ReceivableOverviewProps) {
	const {
		receivable: title,
		canReadDebtor,
		canReadContract,
		canReadReceipts,
		canReadAttachments,
		canReadAudit,
	} = useReceivableWorkspace(id);
	const origin = title.contractId
		? title.processNumber || `Contrato #${title.contractId}`
		: "Sem vínculo com contrato";
	const settlementAction = (
		<TitleSettlementAction
			direction="receivable"
			titleId={id}
			balance={title.balance}
			cancelledAt={title.cancelledAt}
			method={title.expectedMethodValue}
			contractId={title.contractId}
			isAssignedToActor={title.isAssignedToActor}
		/>
	);
	const fields: DetailFieldItem[] = [
		{ term: "Título", definition: `#${id}` },
		{
			term: "Situação",
			definition: <ReceivableStatus receivable={title} />,
		},
		{
			term: "Devedor",
			definition: canReadDebtor ? (
				<RelatedRecordLink kind="client" id={title.debtorPersonId}>
					{title.debtorName}
				</RelatedRecordLink>
			) : (
				title.debtorName
			),
		},
		{
			term: "Origem",
			definition:
				title.contractId && canReadContract ? (
					<RelatedRecordLink kind="contract" id={title.contractId}>
						{origin}
					</RelatedRecordLink>
				) : (
					origin
				),
		},
		{
			term: "Receita",
			definition: title.revenueId ? `#${title.revenueId}` : "—",
		},
		{
			term: "Classificação",
			definition: RECEIVABLE_KINDS.find((item) => item.value === title.kind)
				?.label,
		},
		{
			term: "Vencimento",
			definition: formatter.calendarDate(title.dueDate),
		},
		{ term: "Analítica", definition: title.analytic },
		{ term: "Meio previsto", definition: title.expectedMethod },
		...(
			[
				["amount", "Valor nominal"],
				["principalAbated", "Principal abatido"],
				["balance", "Saldo"],
				["cashReceived", "Caixa recebido"],
			] as const
		).map(([key, term]) => ({
			term,
			definition: (
				<SensitiveValue>{formatter.currency(title[key])}</SensitiveValue>
			),
		})),
		...(title.cancelledAt
			? [
					{
						term: "Cancelado em",
						definition: formatter.date(title.cancelledAt),
					},
					{
						term: "Motivo do cancelamento",
						definition: title.cancellationReason || "—",
					},
				]
			: []),
	];
	if (section === "overview") {
		return (
			<FormSection title="Dados do título" action={settlementAction}>
				<EntityDetail.Fields
					columns={2}
					items={[
						...fields,
						{
							term: "Observações",
							definition: title.notes || "—",
							classNames: {
								item: "col-span-2",
								definition: "whitespace-pre-wrap",
							},
						},
					]}
				/>
			</FormSection>
		);
	}
	return (
		<div className="flex min-w-0 flex-col gap-3">
			<div>{settlementAction}</div>
			<EntityDetail.Fields columns={2} items={fields} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Observações">
				<p className="whitespace-pre-wrap text-sm">
					{title.notes?.trim() || "—"}
				</p>
			</EntityDetail.Section>
			{canReadReceipts ? (
				<>
					<EntityDetail.Separator />
					<EntityDetail.Section title="Recebimentos">
						<ReceivableReceipts id={id} />
					</EntityDetail.Section>
				</>
			) : null}
			{canReadAttachments ? (
				<>
					<EntityDetail.Separator />
					<AttachmentSection
						ownerId={id}
						ownerKind="receivable"
						canUpload={false}
					/>
				</>
			) : null}
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields
					columns={2}
					items={[
						{ term: "Criado em", definition: formatter.date(title.createdAt) },
						{
							term: "Atualizado em",
							definition: formatter.date(title.updatedAt),
						},
					]}
				/>
			</EntityDetail.Section>
			{canReadAudit ? (
				<>
					<EntityDetail.Separator />
					<EntityDetail.Section title="Histórico">
						<EntityAuditHistory entityType="Receivable" entityId={id} />
					</EntityDetail.Section>
				</>
			) : null}
		</div>
	);
}
