import { FilterWrapper } from "@/shared/components/filter-wrapper";
import { useAuditLogOptions } from "../../hooks/use-data";
import { useAuditLogFilter } from "../../hooks/use-filter";

export const AuditLogFilter = () => {
	const { form } = useAuditLogFilter();
	const { actions, entityTypes, actors } = useAuditLogOptions();

	return (
		<form.Form
			form={form}
			className="flex flex-wrap items-center justify-end gap-3"
		>
			<FilterWrapper>
				<form.AppField name="action">
					{(field) => <field.CheckboxGroup label="Ação" options={actions} />}
				</form.AppField>
				<form.AppField name="entityType">
					{(field) => (
						<field.CheckboxGroup label="Tipo" options={entityTypes} />
					)}
				</form.AppField>
				<form.AppField name="actorName">
					{(field) => <field.CheckboxGroup label="Usuário" options={actors} />}
				</form.AppField>
			</FilterWrapper>
		</form.Form>
	);
};
