import { FilterPopover } from "@/shared/components/filter-popover";
import { Separator } from "@/shared/components/ui";
import {
	ENTITY_ACTIVE_FILTER_OPTIONS,
	ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useClientOptions } from "../../hooks/use-data";
import { useClientFilter } from "../../hooks/use-filter";

export const ClientFilter = () => {
	const { form, hasNonDefaultFilter } = useClientFilter();
	const { types } = useClientOptions();

	return (
		<form.Form
			form={form}
			className="w-full md:w-fit flex items-center justify-between gap-3"
		>
			<form.AppField name="query">
				{(field) => (
					<field.Search
						aria-label="Nome ou documento"
						placeholder="Buscar por nome ou documento..."
						className="md:w-80"
					/>
				)}
			</form.AppField>
			<FilterPopover
				showActiveIndicator
				hasActiveIndicator={hasNonDefaultFilter(["type", "active", "status"])}
			>
				<form.AppField name="type">
					{(field) => <field.CheckboxGroup label="Tipo" options={types} />}
				</form.AppField>
				<form.AppField name="active">
					{(field) => (
						<field.RadioGroup
							label="Situação ativa"
							options={ENTITY_ACTIVE_FILTER_OPTIONS}
						/>
					)}
				</form.AppField>
				<Separator />
				<form.AppField name="status">
					{(field) => (
						<field.RadioGroup
							label="Situação do registro"
							options={ENTITY_DELETED_FILTER_OPTIONS}
						/>
					)}
				</form.AppField>
			</FilterPopover>
		</form.Form>
	);
};
