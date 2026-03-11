import { useStore } from "@tanstack/react-form-start";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog";
import { FieldGroup } from "@/shared/components/ui/field";
import { Separator } from "@/shared/components/ui/separator";
import { useEmployeeForm } from "../../hooks/form";
import { useEmployeeOptions } from "../../hooks/options";

export const EmployeeForm = () => {
	const form = useEmployeeForm();
	const { roles, types } = useEmployeeOptions();

	const value = useStore(form.store, (state) => state.values);

	return (
		<Dialog open>
			<DialogTrigger>Open</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Novo Funcionário</DialogTitle>
				</DialogHeader>
				<DialogDescription>{JSON.stringify(value, null, 2)}</DialogDescription>
				<DialogBody>
					<FieldGroup className="grid grid-cols-2">
						<form.AppField
							name="fullName"
							children={(field) => (
								<field.Input
									label="Nome"
									isRequired
									classNames={{
										wrapper: "col-span-full",
									}}
								/>
							)}
						/>
						<form.AppField
							name="email"
							children={(field) => (
								<field.Input
									label="Email"
									isRequired
									classNames={{
										wrapper: "col-span-full",
									}}
								/>
							)}
						/>
						<form.AppField
							name="type"
							children={(field) => (
								<field.Autocomplete
									label="Função"
									options={types}
									isRequired
									classNames={{
										wrapper: "col-span-full",
									}}
								/>
							)}
						/>
						<form.AppField
							name="oabNumber"
							children={(field) => (
								<field.Input label="OAB" placeholder="RS000000" maxLength={8} />
							)}
						/>
						<form.AppField name="role">
							{(field) => (
								<field.Autocomplete label="Perfil" options={roles} isRequired />
							)}
						</form.AppField>
					</FieldGroup>
					<Separator />
					<FieldGroup className="grid grid-cols-2">
						<form.AppField
							name="remunerationPercent"
							children={(field) => (
								<field.Number
									label="% Remuneração"
									minValue={0}
									maxValue={1}
									step={0.05}
									isRequired
									formatOptions={{
										style: "percent",
									}}
								/>
							)}
						/>
						<form.AppField
							name="referrerPercent"
							children={(field) => (
								<field.Number
									label="% Indicação"
									minValue={0}
									maxValue={1}
									step={0.05}
									isRequired
									formatOptions={{
										style: "percent",
									}}
								/>
							)}
						/>
					</FieldGroup>
				</DialogBody>
				<DialogFooter>
					<form.AppForm>
						<form.Reset />
						<form.Submit />
					</form.AppForm>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
