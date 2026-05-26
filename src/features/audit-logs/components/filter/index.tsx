import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { ListFilters } from "@/shared/components/list-filters";
import { Collapsible, CollapsibleContent } from "@/shared/components/ui";
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
	const [isDesktopPanelOpen, setIsDesktopPanelOpen] =
		React.useState(hasAdvancedFilters);

	React.useEffect(() => {
		if (hasAdvancedFilters) {
			setIsDesktopPanelOpen(true);
		}
	}, [hasAdvancedFilters]);

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
		<ListFilters.Actions className="w-full md:w-auto">
			<ListFilters.Button
				type="button"
				onClick={() => setIsDesktopPanelOpen((open) => !open)}
				aria-expanded={isDesktopPanelOpen}
				className="md:min-w-28"
			>
				Mais filtros
				<ChevronDownIcon
					size={16}
					className={isDesktopPanelOpen ? "rotate-180" : undefined}
				/>
			</ListFilters.Button>
		</ListFilters.Actions>
	);

	const desktopFilterPanel = (
		<Collapsible open={isDesktopPanelOpen} onOpenChange={setIsDesktopPanelOpen}>
			<CollapsibleContent>
				<ListFilters.Panel>
					<form.AppField name="action">
						{(field) => <field.CheckboxGroup label="Ação" options={actions} />}
					</form.AppField>
					<form.AppField name="entityType">
						{(field) => (
							<field.CheckboxGroup label="Tipo" options={entityTypes} />
						)}
					</form.AppField>
					<form.AppField name="actorName">
						{(field) => (
							<field.CheckboxGroup label="Usuário" options={actors} />
						)}
					</form.AppField>
				</ListFilters.Panel>
			</CollapsibleContent>
		</Collapsible>
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
					{isMobile ? mobileFilters : desktopFilterActions}
				</ListFilters.Bar>
				{isMobile ? null : desktopFilterPanel}
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
