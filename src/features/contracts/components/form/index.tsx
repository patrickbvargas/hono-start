import { PlusIcon, Trash2Icon } from "lucide-react";
import { useRef } from "react";
import { FormWrapper } from "@/shared/components/form-wrapper";
import { Button, Field } from "@/shared/components/ui";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { CONTRACT_MAX_EMPLOYEES, CONTRACT_MAX_REVENUES } from "../../constants";
import { useContractForm } from "../../hooks/use-form";
import { useContractOptions } from "../../hooks/use-options";
import type { Contract } from "../../schemas/model";
import {
	defaultContractAssignmentValues,
	defaultContractRevenueValues,
	defaultContractUpdateValues,
} from "../../utils/default";

interface ContractFormProps {
	contract?: Contract;
	state: OverlayState;
	onSuccess?: () => void;
}

export const ContractForm = ({
	contract,
	state,
	onSuccess,
}: ContractFormProps) => {
	const rowKeysRef = useRef(new WeakMap<object, string>());
	const rowKeyCountRef = useRef(0);
	const {
		clients,
		legalAreas,
		statuses,
		assignmentTypes,
		revenueTypes,
		employees,
	} = useContractOptions();
	const { form } = useContractForm({
		initialData: contract && defaultContractUpdateValues(contract),
		onSuccess,
	});
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	const getRowKey = (value: object) => {
		const existingKey = rowKeysRef.current.get(value);
		if (existingKey) {
			return existingKey;
		}

		rowKeyCountRef.current += 1;
		const nextKey = `contract-form-row-${rowKeyCountRef.current}`;
		rowKeysRef.current.set(value, nextKey);
		return nextKey;
	};

	const title = contract ? "Editar contrato" : "Novo contrato";

	return (
		<form.Form form={form}>
			<FormWrapper state={state} title={title} footer={<form.Submit />}>
				<Field.Group>
					<form.AppField name="clientId">
						{(field) => (
							<field.Autocomplete
								label="Cliente"
								options={clients}
								variant="secondary"
								isRequired
							/>
						)}
					</form.AppField>
				</Field.Group>
				<Field.Group className="grid-cols-2">
					<form.AppField name="processNumber">
						{(field) => (
							<field.Input label="Processo" variant="secondary" isRequired />
						)}
					</form.AppField>
					<form.AppField name="legalArea">
						{(field) => (
							<field.Autocomplete
								label="Área"
								options={legalAreas}
								variant="secondary"
								isRequired
							/>
						)}
					</form.AppField>
					<form.AppField name="status">
						{(field) => (
							<field.Autocomplete
								label="Status"
								options={statuses}
								variant="secondary"
								isRequired
							/>
						)}
					</form.AppField>
					<form.AppField name="feePercentage">
						{(field) => (
							<field.Number
								label="% Honorários"
								minValue={0}
								maxValue={1}
								step={0.01}
								variant="secondary"
								isRequired
								fullWidth
								formatOptions={{ style: "percent" }}
							/>
						)}
					</form.AppField>
				</Field.Group>
				<Field.Group>
					<form.AppField name="notes">
						{(field) => (
							<field.Textarea label="Observações" variant="secondary" />
						)}
					</form.AppField>
				</Field.Group>
				<Field.Group className="grid-cols-2">
					<form.AppField name="isActive">
						{(field) => <field.Checkbox label="Ativo" variant="secondary" />}
					</form.AppField>
					{isAdmin ? (
						<form.AppField name="allowStatusChange">
							{(field) => (
								<field.Checkbox
									label="Permitir mudança de status"
									variant="secondary"
								/>
							)}
						</form.AppField>
					) : null}
				</Field.Group>
				<form.AppField name="assignments" mode="array">
					{(subField) => (
						<Field.Group>
							<Button
								size="sm"
								variant="secondary"
								onPress={() =>
									subField.pushValue(defaultContractAssignmentValues())
								}
								isDisabled={
									subField.state.value.length >= CONTRACT_MAX_EMPLOYEES
								}
							>
								<PlusIcon size={16} />
								Colaborador
							</Button>
							{subField.state.value.map((assignment, i) => (
								<Field.Group
									key={getRowKey(assignment)}
									className="grid-cols-[repeat(2,1fr)_auto]"
								>
									<form.AppField name={`assignments[${i}].employeeId`}>
										{(field) => (
											<field.Autocomplete
												label="Colaborador"
												options={employees}
												variant="secondary"
												isRequired
											/>
										)}
									</form.AppField>
									<form.AppField name={`assignments[${i}].assignmentType`}>
										{(field) => (
											<field.Autocomplete
												label="Atribuição"
												options={assignmentTypes}
												variant="secondary"
												isRequired
											/>
										)}
									</form.AppField>
									<Button
										isIconOnly
										variant="danger-soft"
										className="place-self-end"
										onPress={() => subField.removeValue(i)}
									>
										<Trash2Icon size={16} />
									</Button>
								</Field.Group>
							))}
						</Field.Group>
					)}
				</form.AppField>
				<form.AppField name="revenues" mode="array">
					{(subField) => (
						<Field.Group>
							<Button
								size="sm"
								variant="secondary"
								onPress={() =>
									subField.pushValue(defaultContractRevenueValues())
								}
								isDisabled={
									subField.state.value.length >= CONTRACT_MAX_REVENUES
								}
							>
								<PlusIcon size={16} />
								Colaborador
							</Button>
							{subField.state.value.map((revenue, i) => (
								<Field.Group key={getRowKey(revenue)}>
									<Field.Group className="grid-cols-[1fr_1fr_auto] items-end">
										<form.AppField name={`revenues[${i}].type`}>
											{(field) => (
												<field.Autocomplete
													label="Tipo de receita"
													options={revenueTypes}
													variant="secondary"
													isRequired
												/>
											)}
										</form.AppField>
										<form.AppField name={`revenues[${i}].paymentStartDate`}>
											{(field) => (
												<field.Input
													label="Início do pagamento"
													type="date"
													variant="secondary"
													isRequired
												/>
											)}
										</form.AppField>
									</Field.Group>
									<Field.Group className="grid-cols-3">
										<form.AppField name={`revenues[${i}].totalValue`}>
											{(field) => (
												<field.Number
													label="Valor total"
													minValue={0}
													step={100}
													variant="secondary"
													isRequired
													fullWidth
													formatOptions={{
														style: "currency",
														currency: "BRL",
													}}
												/>
											)}
										</form.AppField>
										<form.AppField name={`revenues[${i}].downPaymentValue`}>
											{(field) => (
												<field.Number
													label="Entrada"
													minValue={0}
													step={100}
													variant="secondary"
													fullWidth
													formatOptions={{
														style: "currency",
														currency: "BRL",
													}}
												/>
											)}
										</form.AppField>
										<form.AppField name={`revenues[${i}].totalInstallments`}>
											{(field) => (
												<field.Number
													label="Parcelas"
													minValue={1}
													step={1}
													variant="secondary"
													isRequired
													fullWidth
												/>
											)}
										</form.AppField>
									</Field.Group>
									<form.AppField name={`revenues[${i}].isActive`}>
										{(field) => <field.Checkbox label="Receita ativa" />}
									</form.AppField>
									<Button
										isIconOnly
										variant="danger-soft"
										className="place-self-end"
										onPress={() => subField.removeValue(i)}
									>
										<Trash2Icon size={16} />
									</Button>
								</Field.Group>
							))}
						</Field.Group>
					)}
				</form.AppField>
			</FormWrapper>
		</form.Form>
	);
};
