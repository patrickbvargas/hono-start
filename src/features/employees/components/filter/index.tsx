import { useDebounce } from "@/shared/hooks/use-debounce";
import { useEmployeeFilter } from "../../hooks/use-filter";
import { useEmployeeOptions } from "../../hooks/use-options";

export const EmployeeFilter = () => {
	const { form } = useEmployeeFilter();
	const { types, roles } = useEmployeeOptions();

	const debouncedSubmit = useDebounce(() => form.handleSubmit(), 300);

	return (
		<form.Form form={form}>
			<div className="flex flex-wrap gap-3">
				<form.AppField
					name="name"
					listeners={{ onChange: () => debouncedSubmit() }}
				>
					{(field) => (
						<field.Input
							label="Nome ou OAB"
							placeholder="Buscar por nome ou OAB..."
							variant="secondary"
						/>
					)}
				</form.AppField>
				<form.AppField
					name="type"
					listeners={{ onChange: () => form.handleSubmit() }}
				>
					{(field) => (
						<field.Multiselect
							label="Cargo"
							options={types}
							variant="secondary"
						/>
					)}
				</form.AppField>
				<form.AppField
					name="role"
					listeners={{ onChange: () => form.handleSubmit() }}
				>
					{(field) => (
						<field.Multiselect
							label="Perfil"
							options={roles}
							variant="secondary"
						/>
					)}
				</form.AppField>
			</div>
		</form.Form>
	);
};
