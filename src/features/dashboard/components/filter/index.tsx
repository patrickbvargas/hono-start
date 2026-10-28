import { renderContractFilterOption } from "@/shared/components/contract-filter-option";
import { ListFilters } from "@/shared/components/list-filters";
import {
	Button,
	Checkbox,
	DateRangePicker,
	Label,
} from "@/shared/components/ui";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { formatter } from "@/shared/lib/formatter";
import { useDashboardOptions } from "../../hooks/use-data";
import { useDashboardFilter } from "../../hooks/use-filter";
import { getDashboardActivePeriodShortcut } from "../../utils/period-shortcuts";

interface DashboardFilterProps {
	isAdmin?: boolean;
	showAllocationFilters?: boolean;
	showDetails?: boolean;
	showDetailsToggle?: boolean;
	onShowDetailsChange?: (checked: boolean) => void;
}

export function DashboardFilter({
	isAdmin = false,
	showAllocationFilters = true,
	showDetails = false,
	showDetailsToggle = true,
	onShowDetailsChange,
}: DashboardFilterProps) {
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
	const { employees, legalAreas, revenueTypes, clients, contracts } =
		useDashboardOptions();
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

	const sharedFields = (
		<>
			{showAllocationFilters ? (
				<>
					<form.AppField name="legalArea">
						{(field) => (
							<field.CheckboxGroup label="Área" options={legalAreas} />
						)}
					</form.AppField>
					<form.AppField name="revenueType">
						{(field) => (
							<field.CheckboxGroup
								label="Tipo de honorário"
								options={revenueTypes}
							/>
						)}
					</form.AppField>
				</>
			) : null}
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
			{showAllocationFilters ? (
				<>
					<ListFilters.Popover label="Área">
						<form.AppField name="legalArea">
							{(field) => <field.CheckboxGroup options={legalAreas} />}
						</form.AppField>
					</ListFilters.Popover>
					<ListFilters.Popover label="Tipo de honorário">
						<form.AppField name="revenueType">
							{(field) => <field.CheckboxGroup options={revenueTypes} />}
						</form.AppField>
					</ListFilters.Popover>
				</>
			) : null}
		</ListFilters.Actions>
	);

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar className="w-full flex-col items-stretch md:flex-row md:items-center md:justify-between">
					<div className="flex w-full flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
						{isAdmin ? (
							<form.AppField name="employeeId">
								{(field) => (
									<field.Autocomplete
										label="Colaborador"
										options={employees}
										placeholder="Colaborador"
										classNames={{
											wrapper:
												"w-full md:w-52 md:shrink-0 xl:w-60 [&_[data-slot=field-label]]:sr-only",
										}}
									/>
								)}
							</form.AppField>
						) : null}
						{showAllocationFilters ? (
							<>
								<form.AppField name="clientId">
									{(field) => (
										<field.Autocomplete
											aria-label="Cliente"
											placeholder="Cliente"
											options={clients}
											classNames={{
												wrapper: "w-full md:w-52 md:shrink-0 xl:w-60",
											}}
										/>
									)}
								</form.AppField>
								<form.AppField name="contractId">
									{(field) => (
										<field.Autocomplete
											aria-label="Contrato"
											placeholder="Contrato"
											options={contracts}
											renderOption={renderContractFilterOption}
											classNames={{
												content: "w-max",
												wrapper: "w-full md:w-52 md:shrink-0 xl:w-60",
											}}
										/>
									)}
								</form.AppField>
							</>
						) : null}
						{isMobile && showAllocationFilters ? mobileFilters : null}
						{!isMobile ? desktopFilterActions : null}
					</div>
				</ListFilters.Bar>
				<div className="flex flex-wrap items-center justify-between gap-2 pt-2">
					<form.Subscribe
						selector={(state) =>
							getDashboardActivePeriodShortcut({
								dateFrom: state.values.dateFrom,
								dateTo: state.values.dateTo,
							})
						}
					>
						{(activeShortcut) => (
							<div
								className="flex flex-wrap items-center gap-2"
								role="group"
								aria-label="Atalhos de período"
							>
								<span className="text-xs text-muted-foreground">Período</span>
								{periodShortcuts.map((shortcut) => (
									<Button
										size="sm"
										key={shortcut.id}
										type="button"
										variant={
											activeShortcut === shortcut.id ? "secondary" : "ghost"
										}
										aria-pressed={activeShortcut === shortcut.id}
										onClick={() => handlePeriodShortcut(shortcut.id)}
									>
										{shortcut.id === "last6Months"
											? "6 meses"
											: shortcut.id === "last12Months"
												? "12 meses"
												: shortcut.id === "currentMonth"
													? "Este mês"
													: "Este ano"}
									</Button>
								))}
								<DateRangePicker
									label="Período personalizado"
									triggerLabel="Personalizado"
									isActive={activeShortcut === null}
									dateFrom={filter.dateFrom}
									dateTo={filter.dateTo}
									onChange={(range) =>
										handleApplyFilter({ ...filter, ...range })
									}
								/>
							</div>
						)}
					</form.Subscribe>
					{showDetailsToggle && (
						<Label className="shrink-0 md:ml-auto">
							<Checkbox
								checked={showDetails}
								onCheckedChange={onShowDetailsChange}
							/>
							Mostrar análises detalhadas
						</Label>
					)}
				</div>
				{hasAdvancedFilters ? (
					<ListFilters.Active>
						{filter.clientId ? (
							<ListFilters.Chip
								onRemove={() => handleApplyFilter({ ...filter, clientId: "" })}
								removeLabel="Remover filtro de cliente"
							>
								{clients.find((option) => option.value === filter.clientId)
									?.label ?? filter.clientId}
							</ListFilters.Chip>
						) : null}
						{filter.contractId ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({ ...filter, contractId: "" })
								}
								removeLabel="Remover filtro de contrato"
							>
								{contracts.find((option) => option.value === filter.contractId)
									?.label ?? filter.contractId}
							</ListFilters.Chip>
						) : null}
						{hasManualPeriod ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										dateFrom: defaultFilter.dateFrom,
										dateTo: defaultFilter.dateTo,
									})
								}
								removeLabel={`Remover filtro de período: ${formatDateRangeChip()}`}
							>
								{formatDateRangeChip()}
							</ListFilters.Chip>
						) : null}
						{showAllocationFilters &&
							filter.legalArea.map((value) => (
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
									removeLabel={`Remover filtro de área: ${legalAreaLabels.get(value) ?? value}`}
								>
									{legalAreaLabels.get(value) ?? value}
								</ListFilters.Chip>
							))}
						{showAllocationFilters &&
							filter.revenueType.map((value) => (
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
									removeLabel={`Remover filtro de tipo de receita: ${revenueTypeLabels.get(value) ?? value}`}
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
