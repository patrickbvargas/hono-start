import { EntityView } from "@/shared/components/entity-view";
import { ListFilters } from "@/shared/components/list-filters";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useAuditLogOptions } from "../../hooks/use-data";
import type { useAuditLogFilter } from "../../hooks/use-filter";

interface AuditLogFilterProps {
	controller: ReturnType<typeof useAuditLogFilter>;
}

export const AuditLogFilter = ({ controller }: AuditLogFilterProps) => {
	const {
		filter,
		defaultFilter,
		form,
		canClearFilters,
		handleApplyFilter,
		handleClearFilters,
	} = controller;
	const { actions, entityTypes, actors } = useAuditLogOptions();
	const isMobile = useIsMobile();

	const actionLabels = new Map(
		actions.map((option) => [option.value, option.label]),
	);
	const entityTypeLabels = new Map(
		entityTypes.map((option) => [option.value, option.label]),
	);
	const actorLabels = new Map(
		actors.map((option) => [option.value, option.label]),
	);

	const activeFilterCount =
		(filter.entityId ? 1 : 0) +
		filter.action.length +
		filter.entityType.length +
		filter.actorName.length;

	const hasAdvancedFilters = activeFilterCount > 0;

	const filterFields = (
		<>
			<form.AppField name="action">
				{(field) => <field.CheckboxGroup label="Ação" options={actions} />}
			</form.AppField>
			<form.AppField name="entityType">
				{(field) => <field.CheckboxGroup label="Tipo" options={entityTypes} />}
			</form.AppField>
			<form.AppField name="actorName">
				{(field) => <field.CheckboxGroup label="Usuário" options={actors} />}
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
								aria-label="Usuário ou entidade"
								placeholder="Buscar por usuário ou entidade..."
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
						{filter.entityId ? (
							<ListFilters.Chip
								removeLabel="Remover filtro de registro"
								onRemove={() =>
									handleApplyFilter({ ...filter, entityId: undefined })
								}
							>
								Registro #{filter.entityId}
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
						{filter.action.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										action: filter.action.filter((item) => item !== value),
									})
								}
								removeLabel={`Remover filtro de ação: ${actionLabels.get(value) ?? value}`}
							>
								{actionLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{filter.entityType.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										entityType: filter.entityType.filter(
											(item) => item !== value,
										),
									})
								}
								removeLabel={`Remover filtro de tipo: ${entityTypeLabels.get(value) ?? value}`}
							>
								{entityTypeLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{filter.actorName.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										actorName: filter.actorName.filter(
											(item) => item !== value,
										),
									})
								}
								removeLabel={`Remover filtro de usuário: ${actorLabels.get(value) ?? value}`}
							>
								{actorLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{canClearFilters ? (
							<ListFilters.Clear onClick={handleClearFilters} />
						) : null}
					</ListFilters.Active>
				)}
			</ListFilters>
		</form.Form>
	);
};
