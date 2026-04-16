import { FilterWrapper } from "@/shared/components/filter-wrapper";
import { Separator } from "@/shared/components/ui";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useClientFilter } from "../../hooks/use-filter";
import { useClientOptions } from "../../hooks/use-options";

export const ClientFilter = () => {
	const { form } = useClientFilter();
	const { types } = useClientOptions();

	return (
		<form.Form
			form={form}
			className="flex flex-wrap items-center justify-between gap-3"
		>
			<form.AppField name="name">
				{(field) => (
					<field.Search
						aria-label="Nome ou documento"
						variant="secondary"
						placeholder="Buscar por nome ou documento..."
					/>
				)}
			</form.AppField>
			<FilterWrapper>
				<form.AppField name="type">
					{(field) => (
						<field.CheckboxGroup
							label="Tipo"
							options={types}
							variant="secondary"
						/>
					)}
				</form.AppField>
				<form.AppField name="active">
					{(field) => (
						<field.RadioGroup
							label="Ativo"
							options={ENTITY_ACTIVE_FILTER_OPTIONS}
							variant="secondary"
						/>
					)}
				</form.AppField>
				<Separator />
				<form.AppField name="status">
					{(field) => (
						<field.RadioGroup
							label="Exclusão"
							options={ENTITY_DELETED_FILTER_OPTIONS}
							variant="secondary"
						/>
					)}
				</form.AppField>
			</FilterWrapper>
		</form.Form>
	);
};
