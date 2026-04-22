import { FilterWrapper } from "@/shared/components/filter-wrapper";
import { Separator } from "@/shared/components/ui";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useEmployeeFilter } from "../../hooks/use-filter";
import { useEmployeeOptions } from "../../hooks/use-options";

export const EmployeeFilter = () => {
	const { form } = useEmployeeFilter();
	const { types, roles } = useEmployeeOptions();

	return (
		<form.Form
			form={form}
			className="flex flex-wrap items-center justify-between gap-3"
		>
			<form.AppField name="query">
				{(field) => (
					<field.Search
						aria-label="Nome ou OAB"
						placeholder="Buscar por nome ou OAB..."
					/>
				)}
			</form.AppField>
			<FilterWrapper>
				<form.AppField name="type">
					{(field) => <field.CheckboxGroup label="Função" options={types} />}
				</form.AppField>
				<form.AppField name="role">
					{(field) => <field.CheckboxGroup label="Perfil" options={roles} />}
				</form.AppField>
				<form.AppField name="active">
					{(field) => (
						<field.RadioGroup
							label="Ativo"
							options={ENTITY_ACTIVE_FILTER_OPTIONS}
						/>
					)}
				</form.AppField>
				<Separator />
				<form.AppField name="status">
					{(field) => (
						<field.RadioGroup
							label="Exclusão"
							options={ENTITY_DELETED_FILTER_OPTIONS}
						/>
					)}
				</form.AppField>
			</FilterWrapper>
		</form.Form>
	);
};
