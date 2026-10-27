import type * as React from "react";
import { FinancialPeriodShortcuts } from "@/shared/components/financial-period-shortcuts";
import { ListFilters } from "@/shared/components/list-filters";
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
	summary?: React.ReactNode;
}

export const RemunerationFilter = ({
	isAdmin = false,
	summary,
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
		!!filter.feeId ||
		(isAdmin && filter.employeeId !== defaultFilter.employeeId) ||
		filter.contractId !== defaultFilter.contractId ||
		filter.dateFrom !== defaultFilter.dateFrom ||
		filter.dateTo !== defaultFilter.dateTo ||
		filter.active !== defaultFilter.active ||
		filter.status !== defaultFilter.status;

	const formatDateChip = (value: string) => {
		return formatter.date(`${value}T12:00:00.000Z`);
	};

	const sharedFields = (
		<>
			<form.AppField name="contractId">
				{(field) => <field.Autocomplete label="Contrato" options={contracts} />}
			</form.AppField>
			{isAdmin ? (
				<form.AppField name="employeeId">
					{(field) => (
						<field.Autocomplete label="Colaborador" options={employees} />
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
		<ListFilters.Actions className="w-full min-w-0 md:w-auto md:flex-nowrap">
			<div className="w-full min-w-0 md:w-52 md:shrink-0 xl:w-60">
				<form.AppField name="contractId">
					{(field) => (
						<field.Autocomplete
							aria-label="Contrato"
							placeholder="Contrato"
							options={contracts}
						/>
					)}
				</form.AppField>
			</div>
			{isAdmin ? (
				<div className="w-full min-w-0 md:w-52 md:shrink-0 xl:w-60">
					<form.AppField name="employeeId">
						{(field) => (
							<field.Autocomplete
								aria-label="Colaborador"
								placeholder="Colaborador"
								options={employees}
							/>
						)}
					</form.AppField>
				</div>
			) : null}
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
	);

	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar className="flex-wrap md:flex-nowrap gap-2">
					<form.AppField name="query">
						{(field) => (
							<field.Search
								aria-label="Número do processo ou colaborador"
								placeholder="Buscar por processo ou colaborador..."
								classNames={{ wrapper: "w-full md:w-52 md:shrink-0 xl:w-60" }}
							/>
						)}
					</form.AppField>
					{isMobile ? mobileFilters : desktopFilterActions}
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
						{filter.feeId ? (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({ ...filter, feeId: undefined })
								}
								removeLabel={`Remover filtro de recebimento #${filter.feeId}`}
							>
								Recebimento #{filter.feeId}
							</ListFilters.Chip>
						) : null}
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
								removeLabel={`Remover filtro de pagamento inicial: ${formatDateChip(filter.dateFrom)}`}
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
								removeLabel={`Remover filtro de pagamento final: ${formatDateChip(filter.dateTo)}`}
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
