import { FilterPopover } from "@/shared/components/filter-popover";
import { Separator } from "@/shared/components/ui";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useRemunerationOptions } from "../../hooks/use-data";
import { useRemunerationFilter } from "../../hooks/use-filter";

interface RemunerationFilterProps {
	isAdmin?: boolean;
}

export const RemunerationFilter = ({
	isAdmin = false,
}: RemunerationFilterProps) => {
	const { form, hasNonDefaultFilter } = useRemunerationFilter();
	const { contracts, employees } = useRemunerationOptions();

	return (
		<form.Form
			form={form}
			className="w-full md:w-fit flex items-center justify-between gap-3"
		>
			<form.AppField name="query">
				{(field) => (
					<field.Search
						aria-label="Número do processo ou colaborador"
						placeholder="Buscar por processo ou colaborador..."
						className="md:w-80"
					/>
				)}
			</form.AppField>
			<FilterPopover
				showActiveIndicator
				hasActiveIndicator={hasNonDefaultFilter([
					"employeeId",
					"contractId",
					"dateFrom",
					"dateTo",
					"active",
					"status",
				])}
			>
				{isAdmin ? (
					<form.AppField name="employeeId">
						{(field) => (
							<field.Autocomplete label="Colaborador" options={employees} />
						)}
					</form.AppField>
				) : null}
				<form.AppField name="contractId">
					{(field) => (
						<field.Autocomplete label="Contrato" options={contracts} />
					)}
				</form.AppField>
				<form.AppField name="dateFrom">
					{(field) => <field.DatePicker label="Competência de" />}
				</form.AppField>
				<form.AppField name="dateTo">
					{(field) => <field.DatePicker label="Competência até" />}
				</form.AppField>
				<form.AppField name="active">
					{(field) => (
						<field.RadioGroup
							label="Situação ativa"
							options={ENTITY_ACTIVE_FILTER_OPTIONS}
						/>
					)}
				</form.AppField>
				<Separator />
				<form.AppField name="status">
					{(field) => (
						<field.RadioGroup
							label="Situação do registro"
							options={ENTITY_DELETED_FILTER_OPTIONS}
						/>
					)}
				</form.AppField>
			</FilterPopover>
		</form.Form>
	);
};
