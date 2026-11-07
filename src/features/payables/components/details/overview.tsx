import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { RelatedRecordLink } from "@/features/related-records";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { FormSection } from "@/shared/components/form-section";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import { PAYABLE_KINDS } from "../../constants/values";
import { usePayableWorkspace } from "../../hooks/use-workspace";
import { PayableStatus } from "../status";
import { PayablePayments } from "./payments";

interface PayableOverviewProps {
	id: number;
	section?: "all" | "overview";
}
export function PayableOverview({ id, section = "all" }: PayableOverviewProps) {
	const {
		payable: title,
		canReadContract,
		canReadExpense,
		canReadPayments,
		canReadAttachments,
		canReadAudit,
	} = usePayableWorkspace(id);
	const origin = title.expenseId
		? `Despesa #${title.expenseId}`
		: title.contractId
			? `Remuneração • ${title.processNumber || `Contrato #${title.contractId}`}`
			: "Direto";
	const fields: DetailFieldItem[] = [
		{ term: "Título", definition: `#${id}` },
		{
			term: "Situação",
			definition: <PayableStatus payable={title} />,
		},
		{
			term: "Beneficiário",
			definition: title.beneficiaryName,
		},
		{
			term: "Origem",
			definition:
				title.expenseId && canReadExpense ? (
					<RelatedRecordLink kind="expense" id={title.expenseId}>
						{origin}
					</RelatedRecordLink>
				) : title.contractId && canReadContract ? (
					<RelatedRecordLink kind="contract" id={title.contractId}>
						{origin}
					</RelatedRecordLink>
				) : (
					origin
				),
		},
		{
			term: "Classificação",
			definition: PAYABLE_KINDS.find((item) => item.value === title.kind)
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
				["cashPaid", "Caixa pago"],
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
			<FormSection title="Dados do título">
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
			<EntityDetail.Fields columns={2} items={fields} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Observações">
				<p className="whitespace-pre-wrap text-sm">
					{title.notes?.trim() || "—"}
				</p>
			</EntityDetail.Section>
			{canReadPayments ? (
				<>
					<EntityDetail.Separator />
					<EntityDetail.Section title="Pagamentos">
						<PayablePayments id={id} />
					</EntityDetail.Section>
				</>
			) : null}
			{canReadAttachments ? (
				<>
					<EntityDetail.Separator />
					<AttachmentSection
						ownerId={id}
						ownerKind="payable"
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
						<EntityAuditHistory entityType="Payable" entityId={id} />
					</EntityDetail.Section>
				</>
			) : null}
		</div>
	);
}
