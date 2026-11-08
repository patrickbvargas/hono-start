import { EntityView } from "@/shared/components/entity-view";
import { ListFilters } from "@/shared/components/list-filters";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { usePersonOptions } from "../../hooks/use-data";
import type { usePersonFilter } from "../../hooks/use-filter";

interface PersonFilterProps {
	controller: ReturnType<typeof usePersonFilter>;
}

export const PersonFilter = ({ controller }: PersonFilterProps) => {
	const {
		filter,
		defaultFilter,
		form,
		canClearFilters,
		handleApplyFilter,
		handleClearFilters,
	} = controller;
	const { types, employeeTypes } = usePersonOptions();
	const session = useLoggedUserSession();
	const roles = [
		{ value: "CLIENT", label: "Cliente" },
		...(hasPermission(session, "org:suppliers:read")
			? [{ value: "SUPPLIER", label: "Fornecedor" }]
			: []),
		...(hasPermission(session, "org:employees:read")
			? [{ value: "EMPLOYEE", label: "Colaborador" }]
			: []),
	];
	const isMobile = useIsMobile();

	const typeLabels = new Map(
		types.map((option) => [option.value, option.label]),
	);
	const activeLabels = new Map(
		ENTITY_ACTIVE_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);
	const statusLabels = new Map(
		ENTITY_DELETED_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);

	const activeFilterCount =
		filter.roles.length +
		filter.employeeType.length +
		filter.type.length +
		(filter.active !== defaultFilter.active ? 1 : 0) +
		(filter.status !== defaultFilter.status ? 1 : 0);

	const hasAdvancedFilters = activeFilterCount > 0;

	const filterFields = (
		<>
			<form.AppField name="roles">
				{(field) => <field.CheckboxGroup label="Papéis" options={roles} />}
			</form.AppField>
			{hasPermission(session, "org:employees:read") && (
				<form.AppField name="employeeType">
					{(field) => (
						<field.CheckboxGroup label="Função" options={employeeTypes} />
					)}
				</form.AppField>
			)}
			<form.AppField name="type">
				{(field) => <field.CheckboxGroup label="Tipo" options={types} />}
			</form.AppField>
			<form.AppField name="active">
				{(field) => (
					<field.RadioGroup
						label="Situação"
						options={ENTITY_ACTIVE_FILTER_OPTIONS}
					/>
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
								aria-label={
									hasPermission(session, "org:employees:read")
										? "Nome, documento ou OAB"
										: "Nome ou documento"
								}
								placeholder={
									hasPermission(session, "org:employees:read")
										? "Buscar por nome, documento ou OAB..."
										: "Buscar por nome ou documento..."
								}
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
						{filter.roles.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										roles: filter.roles.filter((v) => v !== value),
									})
								}
								removeLabel={`Remover papel: ${value}`}
							>
								{roles.find((r) => r.value === value)?.label ?? value}
							</ListFilters.Chip>
						))}
						{filter.employeeType.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										employeeType: filter.employeeType.filter(
											(v) => v !== value,
										),
									})
								}
								removeLabel={`Remover função: ${value}`}
							>
								{employeeTypes.find((r) => r.value === value)?.label ?? value}
							</ListFilters.Chip>
						))}
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
						{filter.type.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										type: filter.type.filter((item) => item !== value),
									})
								}
								removeLabel={`Remover filtro de tipo: ${typeLabels.get(value) ?? value}`}
							>
								{typeLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{filter.active !== defaultFilter.active ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										active: defaultFilter.active,
									})
								}
								removeLabel={`Remover filtro de situação: ${activeLabels.get(filter.active) ?? filter.active}`}
							>
								{activeLabels.get(filter.active) ?? filter.active}
							</ListFilters.Chip>
						) : null}
						{filter.status !== defaultFilter.status ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										status: defaultFilter.status,
									})
								}
								removeLabel={`Remover filtro de registro: ${statusLabels.get(filter.status) ?? filter.status}`}
							>
								{statusLabels.get(filter.status) ?? filter.status}
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
