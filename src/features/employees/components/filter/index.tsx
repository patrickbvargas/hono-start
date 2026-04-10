import { Settings2Icon } from "lucide-react";
import { Button, Popover, Separator } from "@/shared/components/ui";
import { STATUS_OPTIONS } from "@/shared/constants/options";
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
			<form.AppField name="name">
				{(field) => (
					<field.Search
						aria-label="Nome ou OAB"
						variant="secondary"
						placeholder="Buscar por nome ou OAB..."
					/>
				)}
			</form.AppField>
			<Popover>
				<Popover.Trigger>
					<Button variant="tertiary">
						<Settings2Icon size={16} />
						Filtros
					</Button>
				</Popover.Trigger>
				<Popover.Content placement="bottom end">
					<Popover.Dialog className="space-y-3 p-4">
						<form.AppField name="type">
							{(field) => (
								<field.CheckboxGroup
									label="Cargo"
									options={types}
									variant="secondary"
								/>
							)}
						</form.AppField>
						<form.AppField name="role">
							{(field) => (
								<field.CheckboxGroup
									label="Perfil"
									options={roles}
									variant="secondary"
								/>
							)}
						</form.AppField>
						<form.AppField name="status">
							{(field) => (
								<field.CheckboxGroup
									label="Status"
									options={STATUS_OPTIONS}
									variant="secondary"
								/>
							)}
						</form.AppField>
						<Separator />
						<form.AppField name="showDeleted">
							{(field) => (
								<field.Checkbox label="Exibir excluídos" variant="secondary" />
							)}
						</form.AppField>
					</Popover.Dialog>
				</Popover.Content>
			</Popover>
		</form.Form>
	);
};
