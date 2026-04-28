import { FilterPopover } from "@/shared/components/filter-popover";
import { useDashboardOptions } from "../../hooks/use-data";
import { useDashboardFilter } from "../../hooks/use-filter";

interface DashboardFilterProps {
	isAdmin?: boolean;
}

export function DashboardFilter({ isAdmin = false }: DashboardFilterProps) {
	const { form } = useDashboardFilter();
	const { employees } = useDashboardOptions();

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
					{(field) => <field.Input label="Período de" type="date" />}
				</form.AppField>
				<form.AppField name="dateTo">
					{(field) => <field.Input label="Período até" type="date" />}
				</form.AppField>
			</FilterPopover>
		</form.Form>
	);
}
