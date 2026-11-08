import { ListFilters } from "@/shared/components/list-filters";
import { PeriodShortcuts } from "@/shared/components/period-shortcuts";
import { Checkbox, Label } from "@/shared/components/ui";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { formatter } from "@/shared/lib/formatter";
import { useFinancialOverviewOptions } from "../../hooks/use-data";
import { useFinancialOverviewFilter } from "../../hooks/use-filter";

interface FinancialOverviewFilterProps {
	showDetails?: boolean;
	showDetailsToggle?: boolean;
	onShowDetailsChange?: (checked: boolean) => void;
}

export function FinancialOverviewFilter({
	showDetails = false,
	showDetailsToggle = true,
	onShowDetailsChange,
}: FinancialOverviewFilterProps = {}) {
	const {
		filter,
		defaultFilter,
		form,
		hasManualPeriod,
		handleApplyFilter,
		handleClearAdvancedFilters,
	} = useFinancialOverviewFilter();
	const { analytics, paymentMethods, kinds, legalAreas } =
		useFinancialOverviewOptions();
	const isMobile = useIsMobile();

	const analyticLabels = new Map(
		analytics.map((option) => [option.value, option.label]),
	);
	const paymentMethodLabels = new Map(
		paymentMethods.map((option) => [option.value, option.label]),
	);
	const kindLabels = new Map(
		kinds.map((option) => [option.value, option.label]),
	);
	const legalAreaLabels = new Map(
		legalAreas.map((option) => [option.value, option.label]),
	);

	const formatDateRangeChip = () => {
		return `${formatter.date(`${filter.dateFrom}T12:00:00.000Z`)} - ${formatter.date(`${filter.dateTo}T12:00:00.000Z`)}`;
	};

	const popoverFilterCount =
		(filter.paymentMethods?.length ?? 0) +
		(filter.kinds?.length ?? 0) +
		(filter.legalAreas?.length ?? 0);

	const filterFields = (
		<>
			{paymentMethods.length > 0 ? (
				<form.AppField name="paymentMethods">
					{(field) => (
						<field.CheckboxGroup
							label="Meio de pagamento"
							options={paymentMethods}
						/>
					)}
				</form.AppField>
			) : null}
			{kinds.length > 0 ? (
				<form.AppField name="kinds">
					{(field) => (
						<field.CheckboxGroup
							label="Classificação do título"
							options={kinds}
						/>
					)}
				</form.AppField>
			) : null}
			{legalAreas.length > 0 ? (
				<form.AppField name="legalAreas">
					{(field) => (
						<field.CheckboxGroup label="Área jurídica" options={legalAreas} />
					)}
				</form.AppField>
			) : null}
		</>
	);

	const hasActiveChips =
		Boolean(filter.analytic) ||
		(filter.paymentMethods && filter.paymentMethods.length > 0) ||
		(filter.kinds && filter.kinds.length > 0) ||
		(filter.legalAreas && filter.legalAreas.length > 0) ||
		hasManualPeriod;

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar>
					<form.AppField name="analytic">
						{(field) => (
							<field.Autocomplete
								aria-label="Analítica"
								placeholder="Analítica"
								options={analytics}
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
					)}
				</ListFilters.Bar>

				{hasActiveChips ? (
					<ListFilters.Active>
						{filter.analytic ? (
							<ListFilters.Chip
								onRemove={() => handleApplyFilter({ ...filter, analytic: "" })}
								removeLabel="Remover filtro de analítica"
							>
								{analyticLabels.get(filter.analytic) ?? filter.analytic}
							</ListFilters.Chip>
						) : null}
						{filter.paymentMethods?.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										paymentMethods: filter.paymentMethods.filter(
											(item) => item !== value,
										),
									})
								}
								removeLabel={`Remover filtro de meio de pagamento: ${paymentMethodLabels.get(value) ?? value}`}
							>
								{paymentMethodLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{filter.kinds?.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										kinds: filter.kinds.filter((item) => item !== value),
									})
								}
								removeLabel={`Remover filtro de classificação: ${kindLabels.get(value) ?? value}`}
							>
								{kindLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
						{filter.legalAreas?.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										legalAreas: filter.legalAreas.filter(
											(item) => item !== value,
										),
									})
								}
								removeLabel={`Remover filtro de área jurídica: ${legalAreaLabels.get(value) ?? value}`}
							>
								{legalAreaLabels.get(value) ?? value}
							</ListFilters.Chip>
						))}
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
						<ListFilters.Clear onClick={handleClearAdvancedFilters} />
					</ListFilters.Active>
				) : null}

				<div className="flex flex-wrap items-center justify-between gap-2 pt-2">
					<PeriodShortcuts
						presets={["last6Months", "last12Months", "currentYear"]}
						dateFrom={filter.dateFrom}
						dateTo={filter.dateTo}
						onChange={(range) => handleApplyFilter({ ...filter, ...range })}
					/>

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
