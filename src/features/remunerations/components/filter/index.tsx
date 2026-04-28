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
	const { form } = useRemunerationFilter();
	const { contracts, employees } = useRemunerationOptions();

	return (
		<form.Form
			form={form}
			className="flex flex-wrap items-center justify-between gap-3"
		>
			<FilterPopover>
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
					{(field) => <field.Input label="Pagamento de" type="date" />}
				</form.AppField>
				<form.AppField name="dateTo">
					{(field) => <field.Input label="Pagamento até" type="date" />}
				</form.AppField>
				<form.AppField name="active">
					{(field) => (
						<field.RadioGroup
							label="Ativo"
							options={ENTITY_ACTIVE_FILTER_OPTIONS}
						/>
					)}
				</form.AppField>
				<Separator />
				<form.AppField name="status">
					{(field) => (
						<field.RadioGroup
							label="Exclusão"
							options={ENTITY_DELETED_FILTER_OPTIONS}
						/>
					)}
				</form.AppField>
			</FilterPopover>
		</form.Form>
	);
};
