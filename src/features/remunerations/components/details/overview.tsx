import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import { RelatedRecordLink } from "@/features/related-records";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { FormSection } from "@/shared/components/form-section";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { useRemuneration } from "../../hooks/use-data";

interface RemunerationOverviewProps {
	section?: "all" | "overview" | "finance";
	id: EntityId;
}
export function RemunerationOverview({
	id,
	section = "all",
}: RemunerationOverviewProps) {
	const { remuneration } = useRemuneration(id);
	const session = useLoggedUserSession();

	const summaryInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Colaborador",
				definition: hasPermission(session, "org:employees:read") ? (
					<RelatedRecordLink kind="employee" id={remuneration.employeeId}>
						{remuneration.employeeName}
					</RelatedRecordLink>
				) : (
					remuneration.employeeName
				),
			},
			{
				term: "Processo",
				definition:
					hasPermission(session, "org:contracts:read_all") ||
					hasPermission(session, "org:contracts:read_assigned") ? (
						<RelatedRecordLink kind="contract" id={remuneration.contractId}>
							{remuneration.contractProcessNumber}
						</RelatedRecordLink>
					) : (
						remuneration.contractProcessNumber
					),
			},
			{
				term: "Cliente",
				definition: hasPermission(session, "org:clients:read") ? (
					<RelatedRecordLink kind="client" id={remuneration.clientId}>
						{remuneration.client}
					</RelatedRecordLink>
				) : (
					remuneration.client
				),
			},
			{
				term: "Data do recebimento",
				definition: formatter.calendarDate(remuneration.paymentDate),
			},
			{ term: "Valor", definition: formatter.currency(remuneration.amount) },
			{
				term: "Percentual efetivo (%)",
				definition: formatter.percent(remuneration.effectivePercentage),
			},
		],
		[remuneration, session],
	);

	const sourceInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Recebimento",
				definition:
					hasPermission(session, "org:fees:read_all") ||
					hasPermission(session, "org:fees:read_assigned") ? (
						<RelatedRecordLink kind="fee" id={remuneration.feeId}>
							Recebimento #{remuneration.feeId}
						</RelatedRecordLink>
					) : (
						String(remuneration.feeId)
					),
			},
			{
				term: "Nº da parcela",
				definition: String(remuneration.feeInstallmentNumber),
			},
			{
				term: "Valor do recebimento",
				definition: formatter.currency(remuneration.feeAmount),
			},
			{
				term: "Origem",
				definition: remuneration.isManualOverride
					? "Ajuste manual"
					: "Gerada automaticamente",
			},
			{
				term: "Situação do recebimento",
				definition: remuneration.parentFeeIsSoftDeleted ? "Excluído" : "Ativo",
			},
		],
		[remuneration, session],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={remuneration.isActive}
						isSoftDeleted={remuneration.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(remuneration.createdAt) },
			{
				term: "Atualizado em",
				definition: formatter.date(remuneration.updatedAt),
			},
		],
		[remuneration],
	);

	if (section === "overview") {
		return (
			<FormSection title="Vínculos da remuneração">
				<EntityDetail.Fields columns={2} items={summaryInfo.slice(0, 3)} />
			</FormSection>
		);
	}
	if (section === "finance") {
		return (
			<div className="space-y-6">
				<FormSection title="Valores registrados">
					<EntityDetail.Fields columns={2} items={summaryInfo.slice(3)} />
				</FormSection>
				<FormSection title="Origem do cálculo">
					<EntityDetail.Fields columns={2} items={sourceInfo} />
				</FormSection>
			</div>
		);
	}

	return (
		<div className="flex min-w-0 flex-col gap-3">
			<EntityDetail.Fields columns={2} items={summaryInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Entender cálculo">
				<div className="mb-3 space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
					<p>
						Base do recebimento:{" "}
						<strong>{formatter.currency(remuneration.feeAmount)}</strong> ·
						Percentual registrado:{" "}
						<strong>
							{formatter.percent(remuneration.effectivePercentage)}
						</strong>
					</p>
					<p>
						Remuneração registrada:{" "}
						<strong>{formatter.currency(remuneration.amount)}</strong>
					</p>
					{remuneration.isManualOverride && (
						<p className="text-muted-foreground">
							Este registro tem ajuste manual. Valor e percentual são
							independentes; alterar um não recalcula o outro.
						</p>
					)}
					<p className="text-muted-foreground">
						Remuneração gerada não confirma pagamento ao colaborador.
					</p>
				</div>
				<EntityDetail.Fields columns={2} items={sourceInfo} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			{hasPermission(session, "org:attachments:read") && (
				<>
					<AttachmentSection
						ownerId={id}
						ownerKind="remuneration"
						canUpload={
							!remuneration.isSoftDeleted &&
							!remuneration.parentFeeIsSoftDeleted
						}
					/>
					<EntityDetail.Separator />
				</>
			)}
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields columns={2} items={registerInfo} />
			</EntityDetail.Section>
		</div>
	);
}
