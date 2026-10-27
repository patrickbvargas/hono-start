import type * as React from "react";
import { FinancialPeriodShortcuts } from "@/shared/components/financial-period-shortcuts";
import { ListFilters } from "@/shared/components/list-filters";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { formatter } from "@/shared/lib/formatter";
import { useExpenseOptions } from "../../hooks/use-data";
import { useExpenseFilter } from "../../hooks/use-filter";

interface ExpenseFilterProps {
	summary?: React.ReactNode;
}
export const ExpenseFilter = ({ summary }: ExpenseFilterProps) => {
	const {
		filter,
		defaultFilter,
		form,
		canClearFilters,
		handleApplyFilter,
		handleClearFilters,
	} = useExpenseFilter();
	const { categories } = useExpenseOptions();
	const isMobile = useIsMobile();

	const categoryLabels = new Map(
		categories.map((option) => [option.value, option.label]),
	);
	const activeLabels = new Map(
		ENTITY_ACTIVE_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);
	const statusLabels = new Map(
		ENTITY_DELETED_FILTER_OPTIONS.map((option) => [option.value, option.label]),
	);

	const hasAdvancedFilters =
		filter.category !== defaultFilter.category ||
		filter.dateFrom !== defaultFilter.dateFrom ||
		filter.dateTo !== defaultFilter.dateTo ||
		filter.active !== defaultFilter.active ||
		filter.status !== defaultFilter.status;

	const formatDateChip = (value: string) =>
		formatter.date(`${value}T12:00:00.000Z`);

	const sharedFields = (
		<>
			{isMobile ? (
				<form.AppField name="category">
					{(field) => (
						<field.Autocomplete label="Categoria" options={categories} />
					)}
				</form.AppField>
			) : null}
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

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar className="flex-wrap md:flex-nowrap gap-2">
					<form.AppField name="query">
						{(field) => (
							<field.Search
								aria-label="Observação"
								placeholder="Buscar por observação..."
								classNames={{ wrapper: "w-full md:w-52 md:shrink-0 xl:w-60" }}
							/>
						)}
					</form.AppField>
					{isMobile ? (
						<ListFilters.Drawer
							title="Filtros"
							label="Filtros"
							ariaLabel="Abrir filtros"
							iconOnly
						>
							{sharedFields}
						</ListFilters.Drawer>
					) : (
						<ListFilters.Actions className="w-full min-w-0 md:w-auto md:flex-nowrap">
							<div className="w-full min-w-0 md:w-52 md:shrink-0 xl:w-60">
								<form.AppField name="category">
									{(field) => (
										<field.Autocomplete
											aria-label="Categoria"
											placeholder="Categoria"
											options={categories}
										/>
									)}
								</form.AppField>
							</div>
							<ListFilters.Popover label="Situação">
								<form.AppField name="active">
									{(field) => (
										<field.RadioGroup options={ENTITY_ACTIVE_FILTER_OPTIONS} />
									)}
								</form.AppField>
							</ListFilters.Popover>
							<ListFilters.Popover label="Registro">
								<form.AppField name="status">
									{(field) => (
										<field.RadioGroup options={ENTITY_DELETED_FILTER_OPTIONS} />
									)}
								</form.AppField>
							</ListFilters.Popover>
						</ListFilters.Actions>
					)}
				</ListFilters.Bar>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<FinancialPeriodShortcuts
						dateFrom={filter.dateFrom}
						dateTo={filter.dateTo}
						onChange={(range) => handleApplyFilter({ ...filter, ...range })}
					/>
					<div className="ml-auto shrink-0">{summary}</div>
				</div>
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
						{filter.category ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										category: defaultFilter.category,
									})
								}
								removeLabel={`Remover filtro de categoria: ${categoryLabels.get(filter.category) ?? filter.category}`}
							>
								{categoryLabels.get(filter.category) ?? filter.category}
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
						{filter.active !== defaultFilter.active ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({ ...filter, active: defaultFilter.active })
								}
								removeLabel={`Remover filtro de situação: ${activeLabels.get(filter.active) ?? filter.active}`}
							>
								{activeLabels.get(filter.active) ?? filter.active}
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
			</ListFilters>
		</form.Form>
	);
};
