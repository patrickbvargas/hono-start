import { useStore } from "@tanstack/react-form-start";
import { Field, Modal } from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployeeForm } from "../../hooks/use-form";
import { useEmployeeOptions } from "../../hooks/use-options";
import type { Employee } from "../../schemas/model";
import { defaultFormUpdateValues } from "../../utils/default";

interface EmployeeFormProps {
	employee?: Employee;
	state: OverlayState;
	onSuccess?: () => void;
}

export const EmployeeForm = ({
	employee,
	state,
	onSuccess,
}: EmployeeFormProps) => {
	const initialData = employee ? defaultFormUpdateValues(employee) : undefined;
	const { form } = useEmployeeForm({ initialData, onSuccess });
	const { roles, types } = useEmployeeOptions();

	const typeValue = useStore(form.store, (s) => s.values.type);
	const isLawyer = Number(typeValue) === 1; // cast because of value coercion in autocomplete
	const isEditing = !!employee;

	return (
		<Modal isOpen={state.isOpen} onOpenChange={state.onOpenChange}>
			<Modal.Backdrop>
				<Modal.Container size="md">
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading>
								{isEditing ? "Editar Funcionário" : "Novo Funcionário"}
							</Modal.Heading>
						</Modal.Header>
						<form.Form form={form}>
							<Modal.Body className="flex flex-col gap-4 p-1">
								<Field.Group>
									<form.AppField name="fullName">
										{(field) => (
											<field.Input
												label="Nome"
												variant="secondary"
												isRequired
											/>
										)}
									</form.AppField>
									<form.AppField name="email">
										{(field) => (
											<field.Input
												label="Email"
												variant="secondary"
												isRequired
											/>
										)}
									</form.AppField>
								</Field.Group>
								<Field.Group className="grid-cols-2">
									<form.AppField
										name="type"
										listeners={{
											onChange: ({ value }) => {
												if (Number(value) === 1)
													form.setFieldValue("oabNumber", ""); // clear OAB when not lawyer
											},
										}}
									>
										{(field) => (
											<field.Autocomplete
												label="Função"
												options={types}
												variant="secondary"
												isRequired
											/>
										)}
									</form.AppField>
									<form.AppField name="role">
										{(field) => (
											<field.Autocomplete
												label="Perfil"
												options={roles}
												variant="secondary"
												isRequired
											/>
										)}
									</form.AppField>
									{isLawyer && (
										<form.AppField name="oabNumber">
											{(field) => (
												<field.Input
													label="OAB"
													placeholder="RS000000"
													variant="secondary"
													maxLength={8}
												/>
											)}
										</form.AppField>
									)}
								</Field.Group>
								<Field.Group className="grid-cols-2">
									<form.AppField name="remunerationPercent">
										{(field) => (
											<field.Number
												label="% Remuneração"
												minValue={0}
												maxValue={1}
												step={0.05}
												variant="secondary"
												isRequired
												fullWidth
												formatOptions={{ style: "percent" }}
											/>
										)}
									</form.AppField>
									<form.AppField name="referrerPercent">
										{(field) => (
											<field.Number
												label="% Indicação"
												minValue={0}
												maxValue={1}
												step={0.05}
												variant="secondary"
												isRequired
												fullWidth
												formatOptions={{ style: "percent" }}
											/>
										)}
									</form.AppField>
								</Field.Group>
								<Field.Group>
									<form.AppField name="isActive">
										{(field) => <field.Checkbox label="Ativo" />}
									</form.AppField>
								</Field.Group>
							</Modal.Body>
							<Modal.Footer>
								<form.Submit />
							</Modal.Footer>
						</form.Form>
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
};
