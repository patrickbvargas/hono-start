import { FilterWrapper } from "@/shared/components/filter-wrapper";
import { Separator } from "@/shared/components/ui";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useFeeOptions } from "../../hooks/use-data";
import { useFeeFilter } from "../../hooks/use-filter";

export const FeeFilter = () => {
	const { form } = useFeeFilter();
	const { contracts, revenues } = useFeeOptions();

	return (
		<form.Form
			form={form}
			className="flex flex-wrap items-center justify-between gap-3"
		>
			<FilterWrapper>
				<form.AppField name="contractId">
					{(field) => (
						<field.Autocomplete label="Contrato" options={contracts} />
					)}
				</form.AppField>
				<form.AppField name="revenueId">
					{(field) => <field.Autocomplete label="Receita" options={revenues} />}
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
			</FilterWrapper>
		</form.Form>
	);
};
