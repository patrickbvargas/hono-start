import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import { RelatedRecordLink } from "@/features/related-records";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { FormSection } from "@/shared/components/form-section";
import { CopyValue } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
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
				definition: (
					<CopyValue
						value={remuneration.contractProcessNumber}
						label="número do processo"
					>
						{hasPermission(session, "org:contracts:read_all") ||
						hasPermission(session, "org:contracts:read_assigned") ? (
							<RelatedRecordLink kind="contract" id={remuneration.contractId}>
								{remuneration.contractProcessNumber}
							</RelatedRecordLink>
						) : (
							remuneration.contractProcessNumber
						)}
					</CopyValue>
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
				term: "Data de recebimento",
				definition: formatter.calendarDate(remuneration.paymentDate),
			},
			{
				term: "Valor",
				definition: (
					<SensitiveValue>
						{formatter.currency(remuneration.amount)}
					</SensitiveValue>
				),
			},
			{
				term: "Percentual efetivo (%)",
				definition: formatter.percent(remuneration.effectivePercentage),
			},
		],
		[remuneration, session],
	);

	const sourceInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Tipo de honorário", definition: remuneration.revenueType },
			{ term: "Vínculo no contrato", definition: remuneration.assignmentType },
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
				definition: (
					<SensitiveValue>
						{formatter.currency(remuneration.feeAmount)}
					</SensitiveValue>
				),
			},
			{
				term: "Origem",
				definition: remuneration.isManualOverride
					? "Ajuste manual"
					: "Gerada automaticamente",
			},
			{
				term: "Situação do recebimento",
				definition: remuneration.parentFeeIsSoftDeleted
					? "Excluído"
					: "Não excluído",
			},
		],
		[remuneration, session],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Criado em", definition: formatter.date(remuneration.createdAt) },
			{
				term: "Atualizado em",
				definition: formatter.date(remuneration.updatedAt),
			},
		],
		[remuneration],
	);

	const calculationSummary = (
		<div
			className={`space-y-2 border-b pb-4 text-sm ${section === "finance" ? "" : "mb-4"}`}
		>
			<p>
				Base do recebimento:{" "}
				<strong>
					<SensitiveValue>
						{formatter.currency(remuneration.feeAmount)}
					</SensitiveValue>
				</strong>{" "}
				· Percentual registrado:{" "}
				<strong>{formatter.percent(remuneration.effectivePercentage)}</strong>
			</p>
			<p>
				Remuneração registrada:{" "}
				<strong>
					<SensitiveValue>
						{formatter.currency(remuneration.amount)}
					</SensitiveValue>
				</strong>
			</p>
			{remuneration.isManualOverride && (
				<p className="text-muted-foreground">
					Este registro tem ajuste manual. Valor e percentual são independentes;
					alterar um não recalcula o outro.
				</p>
			)}
			<p className="text-amber-700 dark:text-amber-400">
				Remuneração gerada não confirma pagamento ao colaborador.
			</p>
		</div>
	);
	if (section === "overview") {
		return (
			<FormSection title="Vínculos da remuneração">
				<EntityDetail.Fields
					columns={2}
					className="grid-cols-1 sm:grid-cols-2"
					items={summaryInfo.slice(0, 3)}
				/>
			</FormSection>
		);
	}
	if (section === "finance") {
		return (
			<div className="space-y-6">
				<FormSection title="Valores registrados">
					<EntityDetail.Fields columns={2} items={summaryInfo.slice(3)} />
				</FormSection>
				<FormSection title="Entender cálculo">
					{calculationSummary}
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
				{calculationSummary}
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
