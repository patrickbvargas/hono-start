import {
	renderEmployeeFilterAvatar,
	renderEmployeeFilterOption,
} from "@/shared/components/employee-filter-option";
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

	const hasAdvancedFilters =
		Boolean(filter.employeeId) ||
		filter.clientId !== defaultFilter.clientId ||
		filter.legalArea.length > 0 ||
		filter.contractStatus.length > 0 ||
		filter.status !== defaultFilter.status;

	const sharedFields = (
		<>
			<form.AppField name="clientId">
				{(field) => <field.Autocomplete label="Cliente" options={clients} />}
			</form.AppField>
			<form.AppField name="legalArea">
				{(field) => <field.CheckboxGroup label="Área" options={legalAreas} />}
			</form.AppField>
			<form.AppField name="employeeId">
				{(field) => (
					<field.Autocomplete
						label="Colaborador"
						options={employees}
						renderOption={renderEmployeeFilterOption}
						renderSelectedAdornment={renderEmployeeFilterAvatar}
					/>
				)}
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

	const mobileFilters = (
		<ListFilters.Drawer
			title="Filtros"
			label="Filtros"
			ariaLabel="Abrir filtros"
			iconOnly
		>
			{sharedFields}
		</ListFilters.Drawer>
	);

	const desktopFilterActions = (
		<ListFilters.Actions className="contents">
			<div className="w-full min-w-0 md:w-52 md:shrink-0 xl:w-60">
				<form.AppField name="clientId">
					{(field) => (
						<field.Autocomplete
							aria-label="Cliente"
							placeholder="Cliente"
							options={clients}
						/>
					)}
				</form.AppField>
			</div>
			<div className="w-full min-w-0 md:w-52 md:shrink-0 xl:w-60">
				<form.AppField name="employeeId">
					{(field) => (
						<field.Autocomplete
							aria-label="Colaborador"
							placeholder="Colaborador"
							options={employees}
							renderOption={renderEmployeeFilterOption}
							renderSelectedAdornment={renderEmployeeFilterAvatar}
						/>
					)}
				</form.AppField>
			</div>
			<ListFilters.Popover label="Área">
				<form.AppField name="legalArea">
					{(field) => <field.CheckboxGroup options={legalAreas} />}
				</form.AppField>
			</ListFilters.Popover>
			<ListFilters.Popover label="Andamento">
				<form.AppField name="contractStatus">
					{(field) => <field.CheckboxGroup options={statuses} />}
				</form.AppField>
			</ListFilters.Popover>
			<ListFilters.Popover label="Registro">
				<form.AppField name="status">
					{(field) => (
						<field.RadioGroup options={ENTITY_DELETED_FILTER_OPTIONS} />
					)}
				</form.AppField>
			</ListFilters.Popover>
		</ListFilters.Actions>
	);

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar className="flex-wrap gap-2">
					<form.AppField name="query">
						{(field) => (
							<field.Search
								aria-label="Número do processo ou cliente"
								placeholder="Buscar por processo ou cliente..."
								classNames={{ wrapper: "w-full md:w-52 md:shrink-0 xl:w-60" }}
							/>
						)}
					</form.AppField>
					{isMobile ? mobileFilters : desktopFilterActions}
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
