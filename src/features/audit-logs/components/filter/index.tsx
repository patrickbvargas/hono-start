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

	const desktopFilters = (
		<ListFilters.Actions>
			<ListFilters.Popover label="Ação">
				<form.AppField name="action">
					{(field) => <field.CheckboxGroup options={actions} />}
				</form.AppField>
			</ListFilters.Popover>
			<ListFilters.Popover label="Tipo">
				<form.AppField name="entityType">
					{(field) => <field.CheckboxGroup options={entityTypes} />}
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
				<ListFilters.Bar>
					<div className="min-w-0 flex-1">
						<form.AppField name="query">
							{(field) => (
								<field.Search
									classNames={{ wrapper: "w-full" }}
									className="w-full md:max-w-100"
									aria-label="Usuário ou entidade"
									placeholder="Buscar por usuário ou entidade..."
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
						{filter.action.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										action: filter.action.filter((item) => item !== value),
									})
								}
								removeLabel={`Remover filtro de ação ${actionLabels.get(value) ?? value}`}
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
								removeLabel={`Remover filtro de tipo ${entityTypeLabels.get(value) ?? value}`}
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
								removeLabel={`Remover filtro de usuário ${actorLabels.get(value) ?? value}`}
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
