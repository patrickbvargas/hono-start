import { FilterPopover } from "@/shared/components/filter-popover";
import { Separator } from "@/shared/components/ui";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useFeeOptions } from "../../hooks/use-data";
import { useFeeFilter } from "../../hooks/use-filter";

export const FeeFilter = () => {
	const { form, hasNonDefaultFilter } = useFeeFilter();
	const { contracts, revenues } = useFeeOptions();

	return (
		<form.Form
			form={form}
			className="w-full md:max-w-100 flex items-center justify-between gap-3"
		>
			<form.AppField name="query">
				{(field) => (
					<field.Search
						aria-label="Número do processo"
						placeholder="Buscar por processo..."
					/>
				)}
			</form.AppField>
			<FilterPopover
				showActiveIndicator
				hasActiveIndicator={hasNonDefaultFilter([
					"contractId",
					"revenueId",
					"dateFrom",
					"dateTo",
					"active",
					"status",
				])}
			>
				<form.AppField name="contractId">
					{(field) => (
						<field.Autocomplete label="Contrato" options={contracts} />
					)}
				</form.AppField>
				<form.AppField name="revenueId">
					{(field) => <field.Autocomplete label="Receita" options={revenues} />}
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
