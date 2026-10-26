import { ListFilters } from "@/shared/components/list-filters";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useAuditLogOptions } from "../../hooks/use-data";
import { useAuditLogFilter } from "../../hooks/use-filter";

export const AuditLogFilter = () => {
	const {
		filter,
		defaultFilter,
		form,
		canClearFilters,
		handleApplyFilter,
		handleClearFilters,
	} = useAuditLogFilter();
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

	const hasAdvancedFilters =
		!!filter.entityId ||
		filter.action.length > 0 ||
		filter.entityType.length > 0 ||
		filter.actorName.length > 0;

	const sharedFields = (
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
		<ListFilters.Actions className="w-full min-w-0 md:w-auto md:flex-nowrap">
			<ListFilters.Popover label="Tipo">
				<form.AppField name="entityType">
					{(field) => <field.CheckboxGroup options={entityTypes} />}
				</form.AppField>
			</ListFilters.Popover>
			<ListFilters.Popover label="Ação">
				<form.AppField name="action">
					{(field) => <field.CheckboxGroup options={actions} />}
				</form.AppField>
			</ListFilters.Popover>
			<ListFilters.Popover label="Usuário">
				<form.AppField name="actorName">
					{(field) => <field.CheckboxGroup options={actors} />}
				</form.AppField>
			</ListFilters.Popover>
		</ListFilters.Actions>
	);

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar className="flex-wrap md:flex-nowrap gap-2">
					<form.AppField name="query">
						{(field) => (
							<field.Search
								aria-label="Usuário ou entidade"
								placeholder="Buscar por usuário ou entidade..."
								classNames={{ wrapper: "w-full md:w-52 md:shrink-0 xl:w-60" }}
							/>
						)}
					</form.AppField>
					{isMobile ? mobileFilters : desktopFilterActions}
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
