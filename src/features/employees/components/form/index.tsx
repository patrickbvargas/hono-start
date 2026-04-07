import { useStore } from "@tanstack/react-form-start";
import { Field, Modal } from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployeeForm } from "../../hooks/form";
import { useEmployeeOptions } from "../../hooks/options";
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
	const { form, Form, FormField, FormSubmit } = useEmployeeForm({
		initialData,
		onSuccess,
	});
	const { roles, types } = useEmployeeOptions();

	const typeValue = useStore(form.store, (state) => state.values.type);
	const isLawyer = typeValue === 1;
	const isEditing = !!employee;

	return (
		<Modal isOpen={state.isOpen} onOpenChange={state.setOpen}>
			<Modal.Backdrop>
				<Modal.Container>
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading>
								{isEditing ? "Editar Funcionário" : "Novo Funcionário"}
							</Modal.Heading>
						</Modal.Header>
						<Form form={form}>
							<Modal.Body className="flex flex-col gap-4 p-1">
								<Field.Group>
									<FormField name="fullName">
										{(field) => (
											<field.Input
												label="Nome"
												variant="secondary"
												isRequired
											/>
										)}
									</FormField>
									<FormField name="email">
										{(field) => (
											<field.Input
												label="Email"
												variant="secondary"
												isRequired
											/>
										)}
									</FormField>
								</Field.Group>
								<Field.Group className="grid-cols-3">
									<FormField name="type">
										{(field) => (
											<field.Autocomplete
												label="Função"
												options={types}
												variant="secondary"
												isRequired
											/>
										)}
									</FormField>
									{isLawyer && (
										<FormField name="oabNumber">
											{(field) => (
												<field.Input
													label="OAB"
													placeholder="RS000000"
													variant="secondary"
													maxLength={8}
												/>
											)}
										</FormField>
									)}
									<FormField name="role">
										{(field) => (
											<field.Autocomplete
												label="Perfil"
												options={roles}
												variant="secondary"
												isRequired
											/>
										)}
									</FormField>
								</Field.Group>
								<Field.Group className="grid grid-cols-2">
									<FormField name="remunerationPercent">
										{(field) => (
											<field.Number
												label="% Remuneração"
												minValue={0}
												maxValue={1}
												step={0.05}
												variant="secondary"
												isRequired
												formatOptions={{ style: "percent" }}
											/>
										)}
									</FormField>
									<FormField name="referrerPercent">
										{(field) => (
											<field.Number
												label="% Indicação"
												minValue={0}
												maxValue={1}
												step={0.05}
												variant="secondary"
												isRequired
												formatOptions={{ style: "percent" }}
											/>
										)}
									</FormField>
								</Field.Group>
								<div className="flex justify-start"></div>
							</Modal.Body>
							<Modal.Footer>
								<FormSubmit />
							</Modal.Footer>
						</Form>
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
};
