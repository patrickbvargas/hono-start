import { FilterWrapper } from "@/shared/components/filter-wrapper";
import { useDashboardFilter } from "../../hooks/use-filter";
import { useDashboardOptions } from "../../hooks/use-options";

interface DashboardFilterProps {
	isAdmin?: boolean;
}

export function DashboardFilter({ isAdmin = false }: DashboardFilterProps) {
	const { form } = useDashboardFilter();
	const { employees } = useDashboardOptions(isAdmin);

	return (
		<form.Form
			form={form}
			className="flex flex-wrap items-center justify-between gap-3"
		>
			<FilterWrapper>
				{isAdmin ? (
					<form.AppField name="employeeId">
						{(field) => (
							<field.Autocomplete
								label="Colaborador"
								options={employees}
								variant="secondary"
							/>
						)}
					</form.AppField>
				) : null}
				<form.AppField name="dateFrom">
					{(field) => (
						<field.Input label="Período de" type="date" variant="secondary" />
					)}
				</form.AppField>
				<form.AppField name="dateTo">
					{(field) => (
						<field.Input label="Período até" type="date" variant="secondary" />
					)}
				</form.AppField>
			</FilterWrapper>
		</form.Form>
	);
}
