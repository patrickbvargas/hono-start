import { FilterPopover } from "@/shared/components/filter-popover";
import { Button, Separator } from "@/shared/components/ui";
import { useAuditLogOptions } from "../../hooks/use-data";
import { useAuditLogFilter } from "../../hooks/use-filter";

export const AuditLogFilter = () => {
	const { form, hasNonDefaultFilter, canClearFilters, handleClearFilters } =
		useAuditLogFilter();
	const { actions, entityTypes, actors } = useAuditLogOptions();

	return (
		<form.Form
			form={form}
			className="w-full md:max-w-100 flex items-center justify-end gap-3"
		>
			<form.AppField name="query">
				{(field) => (
					<field.Search
						aria-label="Usuário ou entidade"
						placeholder="Buscar por usuário ou entidade..."
					/>
				)}
			</form.AppField>
			<FilterPopover
				showActiveIndicator
				hasActiveIndicator={hasNonDefaultFilter([
					"action",
					"entityType",
					"actorName",
				])}
			>
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
				<Separator />
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={!canClearFilters}
					onClick={handleClearFilters}
				>
					Limpar filtros
				</Button>
			</FilterPopover>
		</form.Form>
	);
};
