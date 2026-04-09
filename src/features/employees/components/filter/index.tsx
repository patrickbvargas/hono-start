import { useDebounce } from "@/shared/hooks/use-debounce";
import type { FieldOption } from "@/shared/types/field";
import { useEmployeeFilter } from "../../hooks/use-filter";
import { useEmployeeOptions } from "../../hooks/use-options";

const ACTIVE_OPTIONS: FieldOption[] = [
	{ value: "true", label: "Ativo" },
	{ value: "false", label: "Inativo" },
];

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
				<form.AppField
					name="active"
					listeners={{ onChange: () => form.handleSubmit() }}
				>
					{(field) => (
						<field.Autocomplete
							label="Status"
							options={ACTIVE_OPTIONS}
							variant="secondary"
							placeholder="Todos..."
						/>
					)}
				</form.AppField>
			</div>
		</form.Form>
	);
};
