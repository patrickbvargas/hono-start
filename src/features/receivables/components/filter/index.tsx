import type { ReactNode } from "react";
import { EntityView } from "@/shared/components/entity-view";
import { ListFilters } from "@/shared/components/list-filters";
import { PeriodShortcuts } from "@/shared/components/period-shortcuts";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
	RECEIVABLE_KINDS,
	RECEIVABLE_ORIGINS,
	RECEIVABLE_STATES,
} from "../../constants/values";
import { useReceivableOptions } from "../../hooks/use-data";
import type { useReceivableFilter } from "../../hooks/use-filter";

interface ReceivableFilterProps {
	controller: ReturnType<typeof useReceivableFilter>;
	summary: ReactNode;
}

export function ReceivableFilter({
	controller,
	summary,
}: ReceivableFilterProps) {
	const {
		form,
		filter,
		defaultFilter,
		handleApplyFilter,
		handleClearFilters,
		canClearFilters,
	} = controller;
	const options = useReceivableOptions();
	const isMobile = useIsMobile();

	const fields = (
		<>
			<form.AppField name="debtorId">
				{(field) => (
					<field.Autocomplete label="Devedor" options={options.debtors} />
				)}
			</form.AppField>
			<form.AppField name="contractId">
				{(field) => (
					<field.Autocomplete label="Contrato" options={options.contracts} />
				)}
			</form.AppField>
			<form.AppField name="origin">
				{(field) => (
					<field.Autocomplete
						label="Origem"
						options={[{ value: "", label: "Todas" }, ...RECEIVABLE_ORIGINS]}
					/>
				)}
			</form.AppField>
			<form.AppField name="kind">
				{(field) => (
					<field.Autocomplete
						label="Classificação"
						options={[{ value: "", label: "Todas" }, ...RECEIVABLE_KINDS]}
					/>
				)}
			</form.AppField>
			<form.AppField name="state">
				{(field) => (
					<field.Autocomplete
						label="Situação"
						options={[{ value: "", label: "Todas" }, ...RECEIVABLE_STATES]}
					/>
				)}
			</form.AppField>
			<form.AppField name="analytic">
				{(field) => (
					<field.Autocomplete
						label="Analítica"
						options={[{ value: "", label: "Todas" }, ...options.analytics]}
					/>
				)}
			</form.AppField>
			<form.AppField name="expectedMethod">
				{(field) => (
					<field.Autocomplete
						label="Meio previsto"
						options={[{ value: "", label: "Todos" }, ...options.methods]}
					/>
				)}
			</form.AppField>
		</>
	);

	const labels: Record<string, string> = {
		query: "Busca",
		debtorId: "Devedor",
		contractId: "Contrato",
		origin: "Origem",
		kind: "Classificação",
		state: "Situação",
		analytic: "Analítica",
		expectedMethod: "Meio previsto",
		dateFrom: "Vencimento inicial",
		dateTo: "Vencimento final",
	};

	const optionSets = {
		debtorId: options.debtors,
		contractId: options.contracts,
		origin: RECEIVABLE_ORIGINS,
		kind: RECEIVABLE_KINDS,
		state: RECEIVABLE_STATES,
		analytic: options.analytics,
		expectedMethod: options.methods,
	};

	const popoverActiveKeys = (
		Object.keys(filter) as Array<keyof typeof filter>
	).filter(
		(key) =>
			key !== "query" &&
			key !== "dateFrom" &&
			key !== "dateTo" &&
			filter[key] !== defaultFilter[key],
	);
	const activeFilterCount = popoverActiveKeys.length;

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar>
					<form.AppField name="query">
						{(field) => (
							<field.Search
								aria-label="Buscar títulos"
								placeholder="Buscar por devedor, observação ou processo..."
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
							{fields}
						</ListFilters.Drawer>
					) : (
						<ListFilters.Popover
							title="Filtros"
							label="Filtros"
							activeCount={activeFilterCount}
						>
							{fields}
						</ListFilters.Popover>
					)}
					<EntityView.Toggle />
				</ListFilters.Bar>
				{canClearFilters ? (
					<ListFilters.Active>
						{(Object.keys(filter) as Array<keyof typeof filter>)
							.filter((key) => filter[key] !== defaultFilter[key])
							.map((key) => {
								const value = filter[key];
								const choices = optionSets[key as keyof typeof optionSets];
								const label =
									choices?.find(
										(option) => String(option.value) === String(value),
									)?.label ?? String(value);
								return (
									<ListFilters.Chip
										key={key}
										removeLabel={`Remover ${labels[key]}`}
										onRemove={() =>
											handleApplyFilter({
												...filter,
												[key]: defaultFilter[key],
											})
										}
									>
										{labels[key]}: {label}
									</ListFilters.Chip>
								);
							})}
						<ListFilters.Clear onClick={handleClearFilters} />
					</ListFilters.Active>
				) : null}
				<div className="flex flex-wrap items-center justify-between gap-2 pt-2">
					<PeriodShortcuts
						dateFrom={filter.dateFrom}
						dateTo={filter.dateTo}
						onChange={(range) => handleApplyFilter({ ...filter, ...range })}
					/>
					{summary}
				</div>
			</ListFilters>
		</form.Form>
	);
}
