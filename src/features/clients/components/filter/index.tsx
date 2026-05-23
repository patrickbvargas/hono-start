import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { ListFilters } from "@/shared/components/list-filters";
import { Collapsible, CollapsibleContent } from "@/shared/components/ui";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useClientOptions } from "../../hooks/use-data";
import { useClientFilter } from "../../hooks/use-filter";

export const ClientFilter = () => {
	const {
		filter,
		defaultFilter,
		form,
		canClearFilters,
		handleApplyFilter,
		handleClearFilters,
	} = useClientFilter();
	const { types } = useClientOptions();
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

	const hasAdvancedFilters =
		filter.type.length > 0 ||
		filter.active !== defaultFilter.active ||
		filter.status !== defaultFilter.status;
	const hasDesktopPanelFilters =
		filter.active !== defaultFilter.active ||
		filter.status !== defaultFilter.status;

	const [isDesktopPanelOpen, setIsDesktopPanelOpen] = React.useState(
		hasDesktopPanelFilters,
	);

	React.useEffect(() => {
		if (hasDesktopPanelFilters) {
			setIsDesktopPanelOpen(true);
		}
	}, [hasDesktopPanelFilters]);

	const sharedFields = (
		<>
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
			<ListFilters.Popover label="Tipo">
				<form.AppField name="type">
					{(field) => <field.CheckboxGroup options={types} />}
				</form.AppField>
			</ListFilters.Popover>
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
				</ListFilters.Panel>
			</CollapsibleContent>
		</Collapsible>
	);

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar>
					<form.AppField name="query">
						{(field) => (
							<field.Search
								aria-label="Nome ou documento"
								placeholder="Buscar por nome ou documento..."
								classNames={{ wrapper: "w-full md:max-w-80" }}
							/>
						)}
					</form.AppField>
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
								removeLabel={`Remover filtro de tipo ${typeLabels.get(value) ?? value}`}
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
								removeLabel={`Remover filtro de situação ativa ${activeLabels.get(filter.active) ?? filter.active}`}
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
								removeLabel={`Remover filtro de situação do registro ${statusLabels.get(filter.status) ?? filter.status}`}
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
