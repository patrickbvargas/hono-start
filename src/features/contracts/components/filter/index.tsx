import { FilterPopover } from "@/shared/components/filter-popover";
import { Button, Separator } from "@/shared/components/ui";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useContractFilterOptions } from "../../hooks/use-data";
import { useContractFilter } from "../../hooks/use-filter";

export const ContractFilter = () => {
	const { form, hasNonDefaultFilter, canClearFilters, handleClearFilters } =
		useContractFilter();
	const { clients, legalAreas, statuses } = useContractFilterOptions();

	return (
		<form.Form
			form={form}
			className="w-full md:max-w-100 flex items-center justify-between gap-3"
		>
			<form.AppField name="query">
				{(field) => (
					<field.Search
						aria-label="Número do processo ou cliente"
						placeholder="Buscar por processo ou cliente..."
					/>
				)}
			</form.AppField>
			<FilterPopover
				showActiveIndicator
				hasActiveIndicator={hasNonDefaultFilter([
					"clientId",
					"legalArea",
					"contractStatus",
					"active",
					"status",
				])}
			>
				<form.AppField name="clientId">
					{(field) => <field.Autocomplete label="Cliente" options={clients} />}
				</form.AppField>
				<form.AppField name="legalArea">
					{(field) => <field.CheckboxGroup label="Área" options={legalAreas} />}
				</form.AppField>
				<form.AppField name="contractStatus">
					{(field) => (
						<field.CheckboxGroup
							label="Status do contrato"
							options={statuses}
						/>
					)}
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
				<Separator />
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={!canClearFilters}
					onClick={handleClearFilters}
				>
					Limpar filtros
				</Button>
			</FilterPopover>
		</form.Form>
	);
};
