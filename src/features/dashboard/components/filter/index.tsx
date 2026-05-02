import { FilterPopover } from "@/shared/components/filter-popover";
import { useDashboardOptions } from "../../hooks/use-data";
import { useDashboardFilter } from "../../hooks/use-filter";

interface DashboardFilterProps {
	isAdmin?: boolean;
}

export function DashboardFilter({ isAdmin = false }: DashboardFilterProps) {
	const { form } = useDashboardFilter();
	const { employees, legalAreas, revenueTypes } = useDashboardOptions();

	return (
		<form.Form
			form={form}
			className="flex flex-wrap items-center justify-between gap-3"
		>
			<FilterPopover>
				{isAdmin ? (
					<form.AppField name="employeeId">
						{(field) => (
							<field.Autocomplete label="Colaborador" options={employees} />
						)}
					</form.AppField>
				) : null}
				<form.AppField name="dateFrom">
					{(field) => <field.DatePicker label="Período de" />}
				</form.AppField>
				<form.AppField name="dateTo">
					{(field) => <field.DatePicker label="Período até" />}
				</form.AppField>
				<form.AppField name="legalArea">
					{(field) => (
						<field.Autocomplete label="Área do contrato" options={legalAreas} />
					)}
				</form.AppField>
				<form.AppField name="revenueType">
					{(field) => (
						<field.Autocomplete
							label="Tipo de receita"
							options={revenueTypes}
						/>
					)}
				</form.AppField>
			</FilterPopover>
		</form.Form>
	);
}
