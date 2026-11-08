import type * as React from "react";
import { EntityView } from "@/shared/components/entity-view";
import { ListFilters } from "@/shared/components/list-filters";
import { PeriodShortcuts } from "@/shared/components/period-shortcuts";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { ENTITY_DELETED_FILTER_OPTIONS } from "@/shared/lib/entity-management";
import { formatter } from "@/shared/lib/formatter";
import { useExpenseOptions } from "../../hooks/use-data";
import type { useExpenseFilter } from "../../hooks/use-filter";

interface ExpenseFilterProps {
	controller: ReturnType<typeof useExpenseFilter>;
	summary?: React.ReactNode;
}

export const ExpenseFilter = ({ controller, summary }: ExpenseFilterProps) => {
	const {
		filter,
		defaultFilter,
		form,
		canClearFilters,
		handleApplyFilter,
		handleClearFilters,
	} = controller;
	const { suppliers } = useExpenseOptions();
	const isMobile = useIsMobile();

	const supplierLabels = new Map(
		suppliers.map((option) => [option.value, option.label]),
	);
	const statusLabels = new Map(
		ENTITY_DELETED_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);

	const activeFilterCount =
		(filter.supplierId !== defaultFilter.supplierId ? 1 : 0) +
		(filter.status !== defaultFilter.status ? 1 : 0);

	const hasAdvancedFilters =
		activeFilterCount > 0 ||
		filter.dateFrom !== defaultFilter.dateFrom ||
		filter.dateTo !== defaultFilter.dateTo;

	const formatDateChip = (value: string) =>
		formatter.date(`${value}T12:00:00.000Z`);

	const filterFields = (
		<>
			<form.AppField name="supplierId">
				{(field) => (
					<field.Autocomplete label="Fornecedor" options={suppliers} />
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

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar>
					<form.AppField name="query">
						{(field) => (
							<field.Search
								aria-label="Observação"
								placeholder="Buscar por fornecedor ou observação..."
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
							activeCount={activeFilterCount}
						>
							{filterFields}
						</ListFilters.Drawer>
					) : (
						<ListFilters.Popover
							title="Filtros"
							label="Filtros"
							activeCount={activeFilterCount}
						>
							{filterFields}
						</ListFilters.Popover>
					)}
					<EntityView.Toggle />
				</ListFilters.Bar>
				{(filter.query || hasAdvancedFilters) && (
					<ListFilters.Active>
						{filter.query ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({ ...filter, query: defaultFilter.query })
								}
								removeLabel={`Remover busca: ${filter.query}`}
							>
								{filter.query}
							</ListFilters.Chip>
						) : null}
						{filter.supplierId ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										supplierId: defaultFilter.supplierId,
									})
								}
								removeLabel={`Remover filtro de fornecedor: ${supplierLabels.get(String(filter.supplierId)) ?? filter.supplierId}`}
							>
								{supplierLabels.get(String(filter.supplierId)) ??
									filter.supplierId}
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
								removeLabel={`Remover data inicial: ${formatDateChip(filter.dateFrom)}`}
							>
								{`De ${formatDateChip(filter.dateFrom)}`}
							</ListFilters.Chip>
						) : null}
						{filter.dateTo ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({ ...filter, dateTo: defaultFilter.dateTo })
								}
								removeLabel={`Remover data final: ${formatDateChip(filter.dateTo)}`}
							>
								{`Até ${formatDateChip(filter.dateTo)}`}
							</ListFilters.Chip>
						) : null}
						{filter.status !== defaultFilter.status ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({ ...filter, status: defaultFilter.status })
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
				<div className="flex flex-wrap items-center justify-between gap-2 pt-2">
					<PeriodShortcuts
						dateFrom={filter.dateFrom}
						dateTo={filter.dateTo}
						onChange={(range) => handleApplyFilter({ ...filter, ...range })}
					/>
					<div className="ml-auto shrink-0">{summary}</div>
				</div>
			</ListFilters>
		</form.Form>
	);
};
