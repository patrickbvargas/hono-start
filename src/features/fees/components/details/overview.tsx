import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import { RelatedRecordLink } from "@/features/related-records";
import { remunerationSearchDefaults } from "@/features/remunerations";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { FormSection } from "@/shared/components/form-section";
import { NavigationLink } from "@/shared/components/navigation-link";
import { CopyValue } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { useFee } from "../../hooks/use-data";

interface FeeOverviewProps {
	section?: "all" | "overview" | "finance";
	id: EntityId;
}
export function FeeOverview({ id, section = "all" }: FeeOverviewProps) {
	const { fee } = useFee(id);
	const session = useLoggedUserSession();

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Processo",
				definition: (
					<CopyValue
						value={fee.contractProcessNumber}
						label="número do processo"
					>
						{hasPermission(session, "org:contracts:read_all") ||
						hasPermission(session, "org:contracts:read_assigned") ? (
							<RelatedRecordLink kind="contract" id={fee.contractId}>
								{fee.contractProcessNumber}
							</RelatedRecordLink>
						) : (
							fee.contractProcessNumber
						)}
					</CopyValue>
				),
			},
			{
				term: "Cliente",
				definition: hasPermission(session, "org:clients:read") ? (
					<RelatedRecordLink kind="client" id={fee.clientId}>
						{fee.client}
					</RelatedRecordLink>
				) : (
					fee.client
				),
			},
			{ term: "Tipo de honorário", definition: fee.revenueType },
			{
				term: "Data de recebimento",
				definition: formatter.calendarDate(fee.paymentDate),
			},
			{
				term: "Valor",
				definition: (
					<SensitiveValue>{formatter.currency(fee.amount)}</SensitiveValue>
				),
			},
			{ term: "Nº da parcela", definition: String(fee.installmentNumber) },
		],
		[fee, session],
	);

	const remunerationInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Remuneração automática",
				definition: fee.generatesRemuneration ? "Sim" : "Não",
			},
			{
				term: "Remunerações vinculadas",
				definition:
					hasPermission(session, "org:remunerations:read_all") ||
					hasPermission(session, "org:remunerations:read_own") ? (
						<NavigationLink
							to="/remuneracoes"
							state={{ resetFilterPanel: true }}
							search={{ ...remunerationSearchDefaults, feeId: id }}
							aria-label={`Ver remunerações do recebimento #${id}`}
						>
							{hasPermission(session, "org:remunerations:read_all")
								? String(fee.remunerationCount)
								: "Ver minhas remunerações"}
						</NavigationLink>
					) : (
						String(fee.remunerationCount)
					),
			},
		],
		[fee, id, session],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Criado em", definition: formatter.date(fee.createdAt) },
			{
				term: "Atualizado em",
				definition: fee.updatedAt ? formatter.date(fee.updatedAt) : "—",
			},
		],
		[fee],
	);

	if (section === "overview") {
		return (
			<FormSection title="Vínculos do recebimento">
				<EntityDetail.Fields
					columns={2}
					className="grid-cols-1 sm:grid-cols-2"
					items={generalInfo.slice(0, 3)}
				/>
			</FormSection>
		);
	}
	if (section === "finance") {
		return (
			<div className="space-y-6">
				<FormSection title="Dados do recebimento">
					<EntityDetail.Fields columns={2} items={generalInfo.slice(3)} />
				</FormSection>
				<FormSection title="Geração de remunerações">
					<EntityDetail.Fields columns={2} items={remunerationInfo} />
				</FormSection>
			</div>
		);
	}

	return (
		<div className="flex min-w-0 flex-col gap-3">
			<EntityDetail.Fields columns={2} items={generalInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Remuneração">
				<EntityDetail.Fields columns={2} items={remunerationInfo} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			{hasPermission(session, "org:attachments:read") && (
				<>
					<AttachmentSection
						ownerId={id}
						ownerKind="fee"
						canUpload={!fee.isSoftDeleted}
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
