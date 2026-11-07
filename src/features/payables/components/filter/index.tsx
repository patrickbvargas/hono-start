import type { ReactNode } from "react";
import { EntityView } from "@/shared/components/entity-view";
import { FinancialPeriodShortcuts } from "@/shared/components/financial-period-shortcuts";
import { ListFilters } from "@/shared/components/list-filters";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
	PAYABLE_KINDS,
	PAYABLE_ORIGINS,
	PAYABLE_STATES,
} from "../../constants/values";
import { usePayableOptions } from "../../hooks/use-data";
import type { usePayableFilter } from "../../hooks/use-filter";

interface PayableFilterProps {
	controller: ReturnType<typeof usePayableFilter>;
	summary: ReactNode;
}
export function PayableFilter({ controller, summary }: PayableFilterProps) {
	const {
		form,
		filter,
		defaultFilter,
		handleApplyFilter,
		handleClearFilters,
		canClearFilters,
	} = controller;
	const options = usePayableOptions();
	const isMobile = useIsMobile();
	const fields = (
		<>
			<form.AppField name="beneficiaryId">
				{(field) => (
					<field.Autocomplete
						label="Beneficiário"
						options={options.beneficiaries}
					/>
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
						options={[{ value: "", label: "Todas" }, ...PAYABLE_ORIGINS]}
					/>
				)}
			</form.AppField>
			<form.AppField name="kind">
				{(field) => (
					<field.Autocomplete
						label="Classificação"
						options={[{ value: "", label: "Todas" }, ...PAYABLE_KINDS]}
					/>
				)}
			</form.AppField>
			<form.AppField name="state">
				{(field) => (
					<field.Autocomplete
						label="Situação"
						options={[{ value: "", label: "Todas" }, ...PAYABLE_STATES]}
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
			<form.AppField name="dateFrom">
				{(field) => <field.DatePicker label="Vencimento inicial" />}
			</form.AppField>
			<form.AppField name="dateTo">
				{(field) => <field.DatePicker label="Vencimento final" />}
			</form.AppField>
		</>
	);
	const labels: Record<string, string> = {
		query: "Busca",
		beneficiaryId: "Beneficiário",
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
		beneficiaryId: options.beneficiaries,
		contractId: options.contracts,
		origin: PAYABLE_ORIGINS,
		kind: PAYABLE_KINDS,
		state: PAYABLE_STATES,
		analytic: options.analytics,
		expectedMethod: options.methods,
	};
	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar>
					<div className="min-w-0 flex-1 md:max-w-80">
						<form.AppField name="query">
							{(field) => (
								<field.Search
									aria-label="Buscar títulos"
									placeholder="Buscar por beneficiário, observação ou processo..."
								/>
							)}
						</form.AppField>
					</div>
					{isMobile ? (
						<ListFilters.Drawer title="Filtros" label="Filtros">
							{fields}
						</ListFilters.Drawer>
					) : (
						<ListFilters.Popover label="Filtros" title="Filtros">
							{fields}
						</ListFilters.Popover>
					)}
					<EntityView.Toggle />
					{canClearFilters ? (
						<ListFilters.Button type="button" onClick={handleClearFilters}>
							Limpar filtros
						</ListFilters.Button>
					) : null}
				</ListFilters.Bar>
				<div className="flex flex-wrap items-center justify-between gap-2 pt-2">
					<FinancialPeriodShortcuts
						dateFrom={filter.dateFrom}
						dateTo={filter.dateTo}
						onChange={(range) => handleApplyFilter({ ...filter, ...range })}
					/>
					{summary}
				</div>
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
					</ListFilters.Active>
				) : null}
			</ListFilters>
		</form.Form>
	);
}
