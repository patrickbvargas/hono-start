import { EntityDetail } from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { FormSection } from "@/shared/components/form-section";
import { CopyValue } from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { usePerson } from "../../hooks/use-data";
import { formatPersonDocument } from "../../utils/format";

interface PersonOverviewProps {
	id: number;
	section?: "all" | "overview" | "contact";
	includeAttachments?: boolean;
}
export function PersonOverview({ id, section = "all" }: PersonOverviewProps) {
	const { person } = usePerson(id);
	const general = [
		{
			term: "Documento",
			definition: person.document ? (
				<CopyValue value={person.document} label="CPF/CNPJ">
					{formatPersonDocument(person.document)}
				</CopyValue>
			) : (
				"—"
			),
		},
		{ term: "Tipo", definition: person.type },
		{ term: "Papéis", definition: person.roles.join(", ") || "—" },
		{ term: "Contratos", definition: person.contractCount },
	];
	const contact = [
		{
			term: "E-mail",
			definition: (
				<CopyValue value={person.email} label="e-mail">
					{person.email ?? "—"}
				</CopyValue>
			),
		},
		{
			term: "Telefone",
			definition: (
				<CopyValue value={person.phone} label="telefone">
					{formatter.phone(person.phone)}
				</CopyValue>
			),
		},
	];
	const register = [
		{
			term: "Situação",
			definition: (
				<EntityStatus
					isActive={person.isActive}
					isSoftDeleted={person.isSoftDeleted}
				/>
			),
		},
		{ term: "Criado em", definition: formatter.date(person.createdAt) },
		{
			term: "Atualizado em",
			definition: person.updatedAt ? formatter.date(person.updatedAt) : "—",
		},
	];
	if (section === "overview") {
		return (
			<FormSection title="Dados da pessoa">
				<EntityDetail.Fields columns={2} items={general} />
			</FormSection>
		);
	}
	if (section === "contact") {
		return (
			<FormSection title="Contato">
				<EntityDetail.Fields columns={2} items={contact} />
			</FormSection>
		);
	}
	return (
		<div className="flex min-w-0 flex-col gap-3">
			<EntityDetail.Fields columns={2} items={general} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Contato">
				<EntityDetail.Fields columns={2} items={contact} />
			</EntityDetail.Section>
			<PersonProfessional id={id} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields columns={2} items={register} />
			</EntityDetail.Section>
		</div>
	);
}
interface PersonProfessionalProps {
	id: number;
}
export function PersonProfessional({ id }: PersonProfessionalProps) {
	const { person } = usePerson(id);
	if (!person.isEmployee || !person.professional) {
		return null;
	}
	const p = person.professional;
	return (
		<FormSection title="Dados profissionais">
			<EntityDetail.Fields
				columns={2}
				items={[
					{ term: "Função", definition: p.typeLabel },
					{ term: "OAB", definition: p.oabNumber ?? "—" },
					{
						term: "Remuneração (%)",
						definition: formatter.percent(p.remunerationPercent),
					},
					{
						term: "Indicação (%)",
						definition: formatter.percent(p.referrerPercent),
					},
				]}
			/>
		</FormSection>
	);
}
