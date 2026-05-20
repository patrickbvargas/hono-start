import { ListFilters } from "@/shared/components/list-filters";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useEmployeeOptions } from "../../hooks/use-data";
import { useEmployeeFilter } from "../../hooks/use-filter";

export const EmployeeFilter = () => {
	const {
		filter,
		defaultFilter,
		form,
		canClearFilters,
		handleApplyFilter,
		handleClearFilters,
	} = useEmployeeFilter();
	const { types, roles } = useEmployeeOptions();
	const isMobile = useIsMobile();

	const typeLabels = new Map(
		types.map((option) => [option.value, option.label]),
	);
	const roleLabels = new Map(
		roles.map((option) => [option.value, option.label]),
	);
	const activeLabels = new Map(
		ENTITY_ACTIVE_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);
	const statusLabels = new Map(
		ENTITY_DELETED_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);

	const hasAdvancedFilters =
		filter.type.length > 0 ||
		filter.role.length > 0 ||
		filter.active !== defaultFilter.active ||
		filter.status !== defaultFilter.status;

	const sharedFields = (
		<>
			<form.AppField name="type">
				{(field) => <field.CheckboxGroup label="Função" options={types} />}
			</form.AppField>
			<form.AppField name="role">
				{(field) => <field.CheckboxGroup label="Perfil" options={roles} />}
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

	const desktopFilters = (
		<ListFilters.Actions>
			<ListFilters.Popover label="Função">
				<form.AppField name="type">
					{(field) => <field.CheckboxGroup options={types} />}
				</form.AppField>
			</ListFilters.Popover>
			<ListFilters.Popover label="Perfil">
				<form.AppField name="role">
					{(field) => <field.CheckboxGroup options={roles} />}
				</form.AppField>
			</ListFilters.Popover>
			<ListFilters.Popover label="Situação">
				<form.AppField name="active">
					{(field) => (
						<field.RadioGroup options={ENTITY_ACTIVE_FILTER_OPTIONS} />
					)}
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
				<ListFilters.Bar>
					<div className="min-w-0 flex-1">
						<form.AppField name="query">
							{(field) => (
								<field.Search
									classNames={{ wrapper: "w-full" }}
									className="w-full md:max-w-80"
									aria-label="Nome ou OAB"
									placeholder="Buscar por nome ou OAB..."
								/>
							)}
						</form.AppField>
					</div>
					{isMobile ? mobileFilters : desktopFilters}
				</ListFilters.Bar>
				{(filter.query || hasAdvancedFilters) && (
					<ListFilters.Active>
						{filter.query ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										query: defaultFilter.query,
									})
								}
								removeLabel={`Remover busca ${filter.query}`}
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
								removeLabel={`Remover filtro de função ${typeLabels.get(value) ?? value}`}
							>
								{typeLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{filter.role.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										role: filter.role.filter((item) => item !== value),
									})
								}
								removeLabel={`Remover filtro de perfil ${roleLabels.get(value) ?? value}`}
							>
								{roleLabels.get(value) ?? value}
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
								removeLabel={`Remover filtro de situação ${activeLabels.get(filter.active) ?? filter.active}`}
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
								removeLabel={`Remover filtro de registro ${statusLabels.get(filter.status) ?? filter.status}`}
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
