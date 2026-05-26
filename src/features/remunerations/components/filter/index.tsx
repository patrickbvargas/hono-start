import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { ListFilters } from "@/shared/components/list-filters";
import { Collapsible, CollapsibleContent } from "@/shared/components/ui";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { formatter } from "@/shared/lib/formatter";
import { useRemunerationOptions } from "../../hooks/use-data";
import { useRemunerationFilter } from "../../hooks/use-filter";

interface RemunerationFilterProps {
	isAdmin?: boolean;
}

export const RemunerationFilter = ({
	isAdmin = false,
}: RemunerationFilterProps) => {
	const {
		filter,
		defaultFilter,
		form,
		canClearFilters,
		handleApplyFilter,
		handleClearFilters,
	} = useRemunerationFilter();
	const { contracts, employees } = useRemunerationOptions();
	const isMobile = useIsMobile();

	const contractLabels = new Map(
		contracts.map((option) => [option.value, option.label]),
	);
	const employeeLabels = new Map(
		employees.map((option) => [option.value, option.label]),
	);
	const activeLabels = new Map(
		ENTITY_ACTIVE_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);
	const statusLabels = new Map(
		ENTITY_DELETED_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);

	const hasAdvancedFilters =
		(isAdmin && filter.employeeId !== defaultFilter.employeeId) ||
		filter.contractId !== defaultFilter.contractId ||
		filter.dateFrom !== defaultFilter.dateFrom ||
		filter.dateTo !== defaultFilter.dateTo ||
		filter.active !== defaultFilter.active ||
		filter.status !== defaultFilter.status;
	const hasDesktopPanelFilters =
		(isAdmin && filter.employeeId !== defaultFilter.employeeId) ||
		filter.contractId !== defaultFilter.contractId ||
		filter.dateFrom !== defaultFilter.dateFrom ||
		filter.dateTo !== defaultFilter.dateTo;

	const [isDesktopPanelOpen, setIsDesktopPanelOpen] = React.useState(
		hasDesktopPanelFilters,
	);

	React.useEffect(() => {
		if (hasDesktopPanelFilters) {
			setIsDesktopPanelOpen(true);
		}
	}, [hasDesktopPanelFilters]);

	const formatDateChip = (value: string) => {
		return formatter.date(`${value}T12:00:00.000Z`);
	};

	const sharedFields = (
		<>
			{isAdmin ? (
				<form.AppField name="employeeId">
					{(field) => (
						<field.Autocomplete label="Colaborador" options={employees} />
					)}
				</form.AppField>
			) : null}
			<form.AppField name="contractId">
				{(field) => <field.Autocomplete label="Contrato" options={contracts} />}
			</form.AppField>
			<form.AppField name="dateFrom">
				{(field) => <field.DatePicker label="Competência de" />}
			</form.AppField>
			<form.AppField name="dateTo">
				{(field) => <field.DatePicker label="Competência até" />}
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
					{isAdmin ? (
						<form.AppField name="employeeId">
							{(field) => (
								<field.Autocomplete label="Colaborador" options={employees} />
							)}
						</form.AppField>
					) : null}
					<form.AppField name="contractId">
						{(field) => (
							<field.Autocomplete label="Contrato" options={contracts} />
						)}
					</form.AppField>
					<form.AppField name="dateFrom">
						{(field) => <field.DatePicker label="Competência de" />}
					</form.AppField>
					<form.AppField name="dateTo">
						{(field) => <field.DatePicker label="Competência até" />}
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
					<form.AppField name="query">
						{(field) => (
							<field.Search
								aria-label="Número do processo ou colaborador"
								placeholder="Buscar por processo ou colaborador..."
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
								removeLabel={`Remover busca: ${filter.query}`}
							>
								{filter.query}
							</ListFilters.Chip>
						) : null}
						{isAdmin && filter.employeeId ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										employeeId: defaultFilter.employeeId,
									})
								}
								removeLabel={`Remover filtro de colaborador: ${employeeLabels.get(filter.employeeId) ?? filter.employeeId}`}
							>
								{employeeLabels.get(filter.employeeId) ?? filter.employeeId}
							</ListFilters.Chip>
						) : null}
						{filter.contractId ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										contractId: defaultFilter.contractId,
									})
								}
								removeLabel={`Remover filtro de contrato: ${contractLabels.get(filter.contractId) ?? filter.contractId}`}
							>
								{contractLabels.get(filter.contractId) ?? filter.contractId}
							</ListFilters.Chip>
						) : null}
						{filter.dateFrom ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										dateFrom: defaultFilter.dateFrom,
									})
								}
								removeLabel={`Remover filtro de competência inicial: ${formatDateChip(filter.dateFrom)}`}
							>
								{`De ${formatDateChip(filter.dateFrom)}`}
							</ListFilters.Chip>
						) : null}
						{filter.dateTo ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										dateTo: defaultFilter.dateTo,
									})
								}
								removeLabel={`Remover filtro de competência final: ${formatDateChip(filter.dateTo)}`}
							>
								{`Até ${formatDateChip(filter.dateTo)}`}
							</ListFilters.Chip>
						) : null}
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
