import { renderContractFilterOption } from "@/shared/components/contract-filter-option";
import {
	renderEmployeeFilterAvatar,
	renderEmployeeFilterOption,
} from "@/shared/components/employee-filter-option";
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

	const popoverFilterCount =
		(filter.clientId ? 1 : 0) +
		(filter.contractId ? 1 : 0) +
		filter.legalArea.length +
		filter.revenueType.length;

	const filterFields = (
		<>
			{showAllocationFilters && (
				<>
					<form.AppField name="clientId">
						{(field) => (
							<field.Autocomplete label="Cliente" options={clients} />
						)}
					</form.AppField>
					<form.AppField name="contractId">
						{(field) => (
							<field.Autocomplete
								label="Contrato"
								options={contracts}
								renderOption={renderContractFilterOption}
							/>
						)}
					</form.AppField>
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
			)}
		</>
	);

	const hasActiveChips =
		Boolean(filter.employeeId) ||
		Boolean(filter.clientId) ||
		Boolean(filter.contractId) ||
		hasManualPeriod ||
		filter.legalArea.length > 0 ||
		filter.revenueType.length > 0;

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar>
					{isAdmin ? (
						<form.AppField name="employeeId">
							{(field) => (
								<field.Autocomplete
									aria-label="Colaborador"
									placeholder="Colaborador"
									options={employees}
									renderOption={renderEmployeeFilterOption}
									renderSelectedAdornment={renderEmployeeFilterAvatar}
									classNames={{
										wrapper: "min-w-0 flex-1 md:max-w-md",
									}}
								/>
							)}
						</form.AppField>
					) : null}
					{showAllocationFilters ? (
						isMobile ? (
							<ListFilters.Drawer
								title="Filtros"
								label="Filtros"
								activeCount={popoverFilterCount}
							>
								{filterFields}
							</ListFilters.Drawer>
						) : (
							<ListFilters.Popover
								title="Filtros"
								label="Filtros"
								activeCount={popoverFilterCount}
							>
								{filterFields}
							</ListFilters.Popover>
						)
					) : null}
				</ListFilters.Bar>
				{hasActiveChips ? (
					<ListFilters.Active>
						{filter.employeeId ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({ ...filter, employeeId: "" })
								}
								removeLabel="Remover filtro de colaborador"
							>
								{employees.find((option) => option.value === filter.employeeId)
									?.label ?? `Colaborador #${filter.employeeId}`}
							</ListFilters.Chip>
						) : null}
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
						{hasActiveChips ? (
							<ListFilters.Clear onClick={handleClearAdvancedFilters} />
						) : null}
					</ListFilters.Active>
				) : null}
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
			</ListFilters>
		</form.Form>
	);
}
