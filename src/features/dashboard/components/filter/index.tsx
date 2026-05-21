import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { ListFilters } from "@/shared/components/list-filters";
import {
	Button,
	Collapsible,
	CollapsibleContent,
} from "@/shared/components/ui";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { formatter } from "@/shared/lib/formatter";
import { useDashboardOptions } from "../../hooks/use-data";
import { useDashboardFilter } from "../../hooks/use-filter";
import { getDashboardActivePeriodShortcut } from "../../utils/period-shortcuts";

interface DashboardFilterProps {
	isAdmin?: boolean;
}

export function DashboardFilter({ isAdmin = false }: DashboardFilterProps) {
	const {
		filter,
		defaultFilter,
		form,
		hasManualPeriod,
		hasAdvancedFilters,
		canClearAdvancedFilters,
		handleApplyFilter,
		handleClearAdvancedFilters,
		handlePeriodShortcut,
		periodShortcuts,
	} = useDashboardFilter();
	const { employees, legalAreas, revenueTypes } = useDashboardOptions();
	const isMobile = useIsMobile();

	const legalAreaLabels = new Map(
		legalAreas.map((option) => [option.value, option.label]),
	);
	const revenueTypeLabels = new Map(
		revenueTypes.map((option) => [option.value, option.label]),
	);

	const formatDateRangeChip = () => {
		return `${formatter.date(`${filter.dateFrom}T12:00:00.000Z`)} - ${formatter.date(`${filter.dateTo}T12:00:00.000Z`)}`;
	};

	const [isDesktopPanelOpen, setIsDesktopPanelOpen] =
		React.useState(hasManualPeriod);

	React.useEffect(() => {
		if (hasManualPeriod) {
			setIsDesktopPanelOpen(true);
		}
	}, [hasManualPeriod]);

	const sharedFields = (
		<>
			<form.AppField name="dateFrom">
				{(field) => <field.DatePicker label="Período de" />}
			</form.AppField>
			<form.AppField name="dateTo">
				{(field) => <field.DatePicker label="Período até" />}
			</form.AppField>
			<form.AppField name="legalArea">
				{(field) => <field.CheckboxGroup label="Área" options={legalAreas} />}
			</form.AppField>
			<form.AppField name="revenueType">
				{(field) => (
					<field.CheckboxGroup label="Tipo de receita" options={revenueTypes} />
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
			<ListFilters.Popover label="Tipo de receita">
				<form.AppField name="revenueType">
					{(field) => <field.CheckboxGroup options={revenueTypes} />}
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
					<form.AppField name="dateFrom">
						{(field) => <field.DatePicker label="Período de" />}
					</form.AppField>
					<form.AppField name="dateTo">
						{(field) => <field.DatePicker label="Período até" />}
					</form.AppField>
				</ListFilters.Panel>
			</CollapsibleContent>
		</Collapsible>
	);

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar className="w-full flex-col items-stretch md:flex-row md:items-center md:justify-between">
					<div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
						{isAdmin ? (
							<form.AppField name="employeeId">
								{(field) => (
									<field.Autocomplete
										label="Colaborador"
										options={employees}
										placeholder="Selecionar colaborador..."
										classNames={{
											wrapper:
												"md:min-w-80 [&_[data-slot=field-label]]:sr-only",
										}}
									/>
								)}
							</form.AppField>
						) : null}
						<form.Subscribe
							selector={(state) =>
								getDashboardActivePeriodShortcut({
									dateFrom: state.values.dateFrom,
									dateTo: state.values.dateTo,
								})
							}
						>
							{(activeShortcut) => (
								<div className="flex items-center gap-2">
									{periodShortcuts.map((shortcut) => (
										<Button
											key={shortcut.id}
											type="button"
											variant={
												activeShortcut === shortcut.id ? "secondary" : "outline"
											}
											aria-pressed={activeShortcut === shortcut.id}
											onClick={() => handlePeriodShortcut(shortcut.id)}
										>
											{shortcut.label}
										</Button>
									))}
								</div>
							)}
						</form.Subscribe>
					</div>
					{isMobile ? mobileFilters : desktopFilterActions}
				</ListFilters.Bar>
				{isMobile ? null : desktopFilterPanel}
				{hasAdvancedFilters ? (
					<ListFilters.Active>
						{hasManualPeriod ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										dateFrom: defaultFilter.dateFrom,
										dateTo: defaultFilter.dateTo,
									})
								}
								removeLabel={`Remover filtro de período ${formatDateRangeChip()}`}
							>
								{formatDateRangeChip()}
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
								removeLabel={`Remover filtro de área do contrato ${legalAreaLabels.get(value) ?? value}`}
							>
								{legalAreaLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{filter.revenueType.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										revenueType: filter.revenueType.filter(
											(item) => item !== value,
										),
									})
								}
								removeLabel={`Remover filtro de tipo de receita ${revenueTypeLabels.get(value) ?? value}`}
							>
								{revenueTypeLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{canClearAdvancedFilters ? (
							<ListFilters.Clear onClick={handleClearAdvancedFilters} />
						) : null}
					</ListFilters.Active>
				) : null}
			</ListFilters>
		</form.Form>
	);
}
