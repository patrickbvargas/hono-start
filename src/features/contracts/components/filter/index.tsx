import { FilterPopover } from "@/shared/components/filter-popover";
import { Separator } from "@/shared/components/ui";
import {
  ENTITY_ACTIVE_FILTER_OPTIONS,
  ENTITY_DELETED_FILTER_OPTIONS,
} from "@/shared/lib/entity-management";
import { useContractOptions } from "../../hooks/use-data";
import { useContractFilter } from "../../hooks/use-filter";

export const ContractFilter = () => {
  const { form } = useContractFilter();
  const { clients, legalAreas, statuses } = useContractOptions();

  return (
    <form.Form form={form} className="flex items-center justify-between gap-3">
      <form.AppField name="query">
        {(field) => (
          <field.Search
            aria-label="Número do contrato ou cliente"
            placeholder="Buscar por contrato ou cliente..."
            className="md:min-w-80"
          />
        )}
      </form.AppField>
      <FilterPopover>
        <form.AppField name="clientId">
          {(field) => <field.Autocomplete label="Cliente" options={clients} />}
        </form.AppField>
        <form.AppField name="legalArea">
          {(field) => (
            <field.CheckboxGroup label="Área jurídica" options={legalAreas} />
          )}
        </form.AppField>
        <form.AppField name="contractStatus">
          {(field) => (
            <field.CheckboxGroup
              label="Status do contrato"
              options={statuses}
            />
          )}
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
      </FilterPopover>
    </form.Form>
  );
};
