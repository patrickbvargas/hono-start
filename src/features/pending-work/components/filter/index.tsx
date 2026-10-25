import { ListFilters } from "@/shared/components/list-filters";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
	PENDING_SEVERITY_OPTIONS,
	PENDING_TYPE_OPTIONS,
} from "../../constants/display";
import { usePendingWorkOptions } from "../../hooks/use-data";
import { usePendingWorkFilter } from "../../hooks/use-filter";

export function PendingWorkFilter() {
	const { clients, employees } = usePendingWorkOptions();
	const isMobile = useIsMobile();
	const {
		filter,
		defaultFilter,
		form,
		handleApplyFilter,
		handleClearFilters,
		canClearFilters,
	} = usePendingWorkFilter();
	return (
		<form.Form form={form} className="w-full">
			<ListFilters>
				<ListFilters.Bar className="flex-wrap">
					<form.AppField name="query">
						{(field) => (
							<field.Search
								aria-label="Contrato ou cliente"
								placeholder="Buscar por contrato ou cliente..."
								classNames={{ wrapper: "w-full md:max-w-80" }}
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
							<form.AppField name="clientId">
								{(field) => (
									<field.Autocomplete label="Cliente" options={clients} />
								)}
							</form.AppField>
							<form.AppField name="employeeId">
								{(field) => (
									<field.Autocomplete label="Colaborador" options={employees} />
								)}
							</form.AppField>
							<form.AppField name="severity">
								{(field) => (
									<field.CheckboxGroup
										label="Criticidade"
										options={PENDING_SEVERITY_OPTIONS}
									/>
								)}
							</form.AppField>
							<form.AppField name="type">
								{(field) => (
									<field.CheckboxGroup
										label="Tipo de pendência"
										options={PENDING_TYPE_OPTIONS}
									/>
								)}
							</form.AppField>
						</ListFilters.Drawer>
					) : (
						<ListFilters.Actions>
							<div className="w-56 shrink-0">
								<form.AppField name="clientId">
									{(field) => (
										<field.Autocomplete
											aria-label="Cliente"
											placeholder="Cliente"
											options={clients}
										/>
									)}
								</form.AppField>
							</div>
							<div className="w-56 shrink-0">
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
							<ListFilters.Popover label="Criticidade">
								<form.AppField name="severity">
									{(field) => (
										<field.CheckboxGroup
											label="Criticidade"
											options={PENDING_SEVERITY_OPTIONS}
										/>
									)}
								</form.AppField>
							</ListFilters.Popover>
							<ListFilters.Popover label="Tipo">
								<form.AppField name="type">
									{(field) => (
										<field.CheckboxGroup
											label="Tipo de pendência"
											options={PENDING_TYPE_OPTIONS}
										/>
									)}
								</form.AppField>
							</ListFilters.Popover>
						</ListFilters.Actions>
					)}
				</ListFilters.Bar>
				{canClearFilters && (
					<ListFilters.Active>
						{filter.query && (
							<ListFilters.Chip
								onRemove={() => handleApplyFilter({ ...filter, query: "" })}
								removeLabel="Remover busca"
							>
								{filter.query}
							</ListFilters.Chip>
						)}
						{filter.severity.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										severity: filter.severity.filter((item) => item !== value),
									})
								}
								removeLabel={`Remover criticidade: ${PENDING_SEVERITY_OPTIONS.find((item) => item.value === value)?.label}`}
							>
								{
									PENDING_SEVERITY_OPTIONS.find((item) => item.value === value)
										?.label
								}
							</ListFilters.Chip>
						))}
						{filter.type.map((value) => (
							<ListFilters.Chip
								key={value}
								onRemove={() =>
									handleApplyFilter({
										...filter,
										type: filter.type.filter((item) => item !== value),
									})
								}
								removeLabel={`Remover tipo: ${PENDING_TYPE_OPTIONS.find((item) => item.value === value)?.label}`}
							>
								{
									PENDING_TYPE_OPTIONS.find((item) => item.value === value)
										?.label
								}
							</ListFilters.Chip>
						))}
						{filter.clientId && (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										clientId: defaultFilter.clientId,
									})
								}
								removeLabel="Remover cliente"
							>
								{clients.find((item) => item.value === filter.clientId)
									?.label ?? `Cliente #${filter.clientId}`}
							</ListFilters.Chip>
						)}
						{filter.employeeId && (
							<ListFilters.Chip
								onRemove={() =>
									handleApplyFilter({
										...filter,
										employeeId: defaultFilter.employeeId,
									})
								}
								removeLabel="Remover colaborador"
							>
								{employees.find((item) => item.value === filter.employeeId)
									?.label ?? `Colaborador #${filter.employeeId}`}
							</ListFilters.Chip>
						)}
						<ListFilters.Clear onClick={handleClearFilters} />
					</ListFilters.Active>
				)}
			</ListFilters>
		</form.Form>
	);
}
