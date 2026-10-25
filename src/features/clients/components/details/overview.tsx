import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import { contractSearchDefaults } from "@/features/contracts";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { FormSection } from "@/shared/components/form-section";
import { NavigationLink } from "@/shared/components/navigation-link";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { useClient } from "../../hooks/use-data";
import { formatClientDocument } from "../../utils/format";

interface ClientOverviewProps {
	section?: "all" | "overview" | "contact";
	id: EntityId;
	includeAttachments?: boolean;
}
export function ClientOverview({
	id,
	includeAttachments = true,
	section = "all",
}: ClientOverviewProps) {
	const { client } = useClient(id);
	const session = useLoggedUserSession();

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Documento", definition: formatClientDocument(client.document) },
			{ term: "Tipo", definition: client.type },
			{
				term: "Contratos",
				definition:
					hasPermission(session, "org:contracts:read_all") ||
					hasPermission(session, "org:contracts:read_assigned") ? (
						<NavigationLink
							to="/contratos"
							state={{ resetFilterPanel: true }}
							aria-label={`Ver contratos de ${client.fullName}`}
							search={{
								...contractSearchDefaults,
								clientId: String(client.id),
							}}
						>
							{client.contractCount}
						</NavigationLink>
					) : (
						client.contractCount
					),
			},
		],
		[client, session],
	);

	const contactInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "E-mail", definition: client.email ?? "—" },
			{ term: "Telefone", definition: formatter.phone(client.phone) },
		],
		[client],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={client.isActive}
						isSoftDeleted={client.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(client.createdAt) },
			{
				term: "Atualizado em",
				definition: client.updatedAt ? formatter.date(client.updatedAt) : "—",
			},
		],
		[client],
	);

	if (section === "overview") {
		return (
			<FormSection title="Dados do cliente">
				<EntityDetail.Fields columns={2} items={generalInfo} />
			</FormSection>
		);
	}
	if (section === "contact") {
		return (
			<FormSection title="Contato">
				<EntityDetail.Fields columns={2} items={contactInfo} />
			</FormSection>
		);
	}

	return (
		<div className="flex min-w-0 flex-col gap-3">
			<EntityDetail.Fields columns={2} items={generalInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Contato">
				<EntityDetail.Fields columns={2} items={contactInfo} />
			</EntityDetail.Section>
			{includeAttachments && (
				<>
					<EntityDetail.Separator />
					<AttachmentSection canUpload ownerId={id} ownerKind="client" />
				</>
			)}
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields columns={2} items={registerInfo} />
			</EntityDetail.Section>
		</div>
	);
}
