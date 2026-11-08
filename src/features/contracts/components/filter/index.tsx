import { EntityView } from "@/shared/components/entity-view";
import { ListFilters } from "@/shared/components/list-filters";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { ENTITY_DELETED_FILTER_OPTIONS } from "@/shared/lib/entity-management";
import { useContractFilterOptions } from "../../hooks/use-data";
import type { useContractFilter } from "../../hooks/use-filter";

interface ContractFilterProps {
	controller: ReturnType<typeof useContractFilter>;
}

export const ContractFilter = ({ controller }: ContractFilterProps) => {
	const {
		filter,
		defaultFilter,
		form,
		canClearFilters,
		handleApplyFilter,
		handleClearFilters,
	} = controller;
	const { clients, legalAreas, statuses, employees } =
		useContractFilterOptions();
	const isMobile = useIsMobile();

	const clientLabels = new Map(
		clients.map((option) => [option.value, option.label]),
	);
	const legalAreaLabels = new Map(
		legalAreas.map((option) => [option.value, option.label]),
	);
	const contractStatusLabels = new Map(
		statuses.map((option) => [option.value, option.label]),
	);
	const deletedLabels = new Map(
		ENTITY_DELETED_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);

	const activeFilterCount =
		(filter.clientId !== defaultFilter.clientId ? 1 : 0) +
		(filter.employeeId ? 1 : 0) +
		filter.legalArea.length +
		filter.contractStatus.length +
		(filter.status !== defaultFilter.status ? 1 : 0);

	const hasAdvancedFilters = activeFilterCount > 0;

	const filterFields = (
		<>
			<form.AppField name="clientId">
				{(field) => <field.Autocomplete label="Cliente" options={clients} />}
			</form.AppField>
			<form.AppField name="employeeId">
				{(field) => (
					<field.Autocomplete label="Colaborador" options={employees} />
				)}
			</form.AppField>
			<form.AppField name="legalArea">
				{(field) => <field.CheckboxGroup label="Área" options={legalAreas} />}
			</form.AppField>
			<form.AppField name="contractStatus">
				{(field) => (
					<field.CheckboxGroup label="Andamento" options={statuses} />
				)}
			</form.AppField>
			<form.AppField name="status">
				{(field) => (
					<field.RadioGroup
						label="Registro"
						options={ENTITY_DELETED_FILTER_OPTIONS}
					/>
				)}
			</form.AppField>
		</>
	);

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar>
					<form.AppField name="query">
						{(field) => (
							<field.Search
								aria-label="Número do processo ou cliente"
								placeholder="Buscar por processo ou cliente..."
								classNames={{
									wrapper: "min-w-0 flex-1 md:max-w-md",
								}}
							/>
						)}
					</form.AppField>
					{isMobile ? (
						<ListFilters.Drawer
							title="Filtros"
							label="Filtros"
							activeCount={activeFilterCount}
						>
							{filterFields}
						</ListFilters.Drawer>
					) : (
						<ListFilters.Popover
							title="Filtros"
							label="Filtros"
							activeCount={activeFilterCount}
						>
							{filterFields}
						</ListFilters.Popover>
					)}
					<EntityView.Toggle />
				</ListFilters.Bar>
				{(filter.query || hasAdvancedFilters) && (
					<ListFilters.Active>
						{filter.employeeId ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({ ...filter, employeeId: "" })
								}
								removeLabel="Remover filtro de colaborador"
							>
								{employees.find((item) => item.value === filter.employeeId)
									?.label ?? `Colaborador #${filter.employeeId}`}
							</ListFilters.Chip>
						) : null}
						{filter.query ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										query: defaultFilter.query,
									})
								}
								removeLabel={`Remover busca: ${filter.query}`}
							>
								{filter.query}
							</ListFilters.Chip>
						) : null}
						{filter.clientId ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										clientId: defaultFilter.clientId,
									})
								}
								removeLabel={`Remover filtro de cliente: ${clientLabels.get(filter.clientId) ?? filter.clientId}`}
							>
								{clientLabels.get(filter.clientId) ?? filter.clientId}
							</ListFilters.Chip>
						) : null}
						{filter.legalArea.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										legalArea: filter.legalArea.filter(
											(item) => item !== value,
										),
									})
								}
								removeLabel={`Remover filtro de área: ${legalAreaLabels.get(value) ?? value}`}
							>
								{legalAreaLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{filter.contractStatus.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										contractStatus: filter.contractStatus.filter(
											(item) => item !== value,
										),
									})
								}
								removeLabel={`Remover filtro de status: ${contractStatusLabels.get(value) ?? value}`}
							>
								{contractStatusLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{filter.status !== defaultFilter.status ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										status: defaultFilter.status,
									})
								}
								removeLabel={`Remover filtro de registro: ${deletedLabels.get(filter.status) ?? filter.status}`}
							>
								{deletedLabels.get(filter.status) ?? filter.status}
							</ListFilters.Chip>
						) : null}
						{canClearFilters ? (
							<ListFilters.Clear onClick={handleClearFilters} />
						) : null}
					</ListFilters.Active>
				)}
			</ListFilters>
		</form.Form>
	);
};
