import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { ListFilters } from "@/shared/components/list-filters";
import { Collapsible, CollapsibleContent } from "@/shared/components/ui";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useContractFilterOptions } from "../../hooks/use-data";
import { useContractFilter } from "../../hooks/use-filter";

export const ContractFilter = () => {
	const {
		filter,
		defaultFilter,
		form,
		canClearFilters,
		handleApplyFilter,
		handleClearFilters,
	} = useContractFilter();
	const { clients, legalAreas, statuses } = useContractFilterOptions();
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
	const activeLabels = new Map(
		ENTITY_ACTIVE_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);
	const deletedLabels = new Map(
		ENTITY_DELETED_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);

	const hasAdvancedFilters =
		filter.clientId !== defaultFilter.clientId ||
		filter.legalArea.length > 0 ||
		filter.contractStatus.length > 0 ||
		filter.active !== defaultFilter.active ||
		filter.status !== defaultFilter.status;
	const hasDesktopPanelFilters =
		filter.clientId !== defaultFilter.clientId ||
		filter.contractStatus.length > 0 ||
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
			<form.AppField name="clientId">
				{(field) => <field.Autocomplete label="Cliente" options={clients} />}
			</form.AppField>
			<form.AppField name="legalArea">
				{(field) => <field.CheckboxGroup label="Área" options={legalAreas} />}
			</form.AppField>
			<form.AppField name="contractStatus">
				{(field) => <field.CheckboxGroup label="Status" options={statuses} />}
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
			<ListFilters.Popover label="Área">
				<form.AppField name="legalArea">
					{(field) => <field.CheckboxGroup options={legalAreas} />}
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
					<form.AppField name="clientId">
						{(field) => (
							<field.Autocomplete label="Cliente" options={clients} />
						)}
					</form.AppField>
					<form.AppField name="contractStatus">
						{(field) => (
							<field.CheckboxGroup label="Status" options={statuses} />
						)}
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
									className="w-full md:max-w-80"
									aria-label="Número do processo ou cliente"
									placeholder="Buscar por processo ou cliente..."
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
								removeLabel={`Remover busca ${filter.query}`}
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
								removeLabel={`Remover filtro de cliente ${clientLabels.get(filter.clientId) ?? filter.clientId}`}
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
								removeLabel={`Remover filtro de área ${legalAreaLabels.get(value) ?? value}`}
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
								removeLabel={`Remover filtro de status do contrato ${contractStatusLabels.get(value) ?? value}`}
							>
								{contractStatusLabels.get(value) ?? value}
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
								removeLabel={`Remover filtro de situação do registro ${deletedLabels.get(filter.status) ?? filter.status}`}
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
