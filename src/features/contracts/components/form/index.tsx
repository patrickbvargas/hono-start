import { PlusIcon, TrashIcon } from "lucide-react";
import * as React from "react";
import { FormWrapper } from "@/shared/components/form-wrapper";
import { Button, Field } from "@/shared/components/ui";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useContractForm } from "../../hooks/use-form";
import { useContractOptions } from "../../hooks/use-options";
import type { Contract } from "../../schemas/model";
import { defaultContractUpdateValues } from "../../utils/default";

interface ContractFormProps {
	contract?: Contract;
	state: OverlayState;
	onSuccess?: () => void;
}

const createEmptyAssignment = () => ({
	employeeId: "",
	assignmentType: "",
	isActive: true,
});

const createEmptyRevenue = () => ({
	type: "",
	totalValue: 0,
	downPaymentValue: null,
	paymentStartDate: "",
	totalInstallments: 1,
	isActive: true,
});

function createRowKey(prefix: string, fallbackId?: number) {
	if (typeof fallbackId === "number") {
		return `${prefix}-${fallbackId}`;
	}

	return `${prefix}-${crypto.randomUUID()}`;
}

function syncRowKeys<TItem extends { id?: number }>(
	existingKeys: string[],
	items: TItem[],
	prefix: string,
) {
	const nextKeys = existingKeys.slice(0, items.length);

	for (const [index, item] of items.entries()) {
		if (!nextKeys[index]) {
			nextKeys[index] = createRowKey(prefix, item.id);
		}
	}

	return nextKeys;
}

export const ContractForm = ({
	contract,
	state,
	onSuccess,
}: ContractFormProps) => {
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
	const assignmentKeysRef = React.useRef<string[]>([]);
	const revenueKeysRef = React.useRef<string[]>([]);

	const title = contract ? "Editar contrato" : "Novo contrato";

	return (
		<form.Form form={form}>
			<FormWrapper state={state} title={title} footer={<form.Submit />}>
				<Field.Group className="grid-cols-2">
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
					<form.AppField name="processNumber">
						{(field) => (
							<field.Input
								label="Número do processo"
								variant="secondary"
								isRequired
							/>
						)}
					</form.AppField>
				</Field.Group>
				<Field.Group className="grid-cols-3">
					<form.AppField name="legalArea">
						{(field) => (
							<field.Autocomplete
								label="Área jurídica"
								options={legalAreas}
								variant="secondary"
								isRequired
							/>
						)}
					</form.AppField>
					<form.AppField name="status">
						{(field) => (
							<field.Autocomplete
								label="Status do contrato"
								options={statuses}
								variant="secondary"
								isRequired
							/>
						)}
					</form.AppField>
					<form.AppField name="feePercentage">
						{(field) => (
							<field.Number
								label="Percentual de honorários"
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
						{(field) => <field.Checkbox label="Ativo" />}
					</form.AppField>
					{isAdmin ? (
						<form.AppField name="allowStatusChange">
							{(field) => <field.Checkbox label="Permitir mudança de status" />}
						</form.AppField>
					) : null}
				</Field.Group>

				<form.Subscribe selector={(state) => state.values.assignments}>
					{(assignments) =>
						(() => {
							assignmentKeysRef.current = syncRowKeys(
								assignmentKeysRef.current,
								assignments,
								"assignment",
							);

							return (
								<section className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3">
										<h3 className="text-sm font-semibold">Equipe</h3>
										<Button
											size="sm"
											variant="secondary"
											type="button"
											onPress={() => {
												assignmentKeysRef.current = [
													...assignmentKeysRef.current,
													createRowKey("assignment"),
												];
												form.setFieldValue("assignments", [
													...assignments,
													createEmptyAssignment(),
												]);
											}}
										>
											<PlusIcon size={16} />
											Adicionar colaborador
										</Button>
									</div>
									{assignments.map((_assignment, index) => (
										<div
											key={assignmentKeysRef.current[index]}
											className="rounded-large border border-divider p-3"
										>
											<Field.Group className="grid-cols-[1fr_1fr_auto] items-end">
												<form.AppField
													name={`assignments[${index}].employeeId` as never}
												>
													{(field) => (
														<field.Autocomplete
															label="Colaborador"
															options={employees}
															variant="secondary"
															isRequired
														/>
													)}
												</form.AppField>
												<form.AppField
													name={`assignments[${index}].assignmentType` as never}
												>
													{(field) => (
														<field.Autocomplete
															label="Tipo de atribuição"
															options={assignmentTypes}
															variant="secondary"
															isRequired
														/>
													)}
												</form.AppField>
												<Button
													type="button"
													variant="ghost"
													isIconOnly
													aria-label="Remover colaborador"
													onPress={() => {
														assignmentKeysRef.current =
															assignmentKeysRef.current.filter(
																(_, currentIndex) => currentIndex !== index,
															);
														form.setFieldValue(
															"assignments",
															assignments.filter(
																(_, currentIndex) => currentIndex !== index,
															),
														);
													}}
												>
													<TrashIcon size={16} />
												</Button>
											</Field.Group>
											<form.AppField
												name={`assignments[${index}].isActive` as never}
											>
												{(field) => <field.Checkbox label="Atribuição ativa" />}
											</form.AppField>
										</div>
									))}
								</section>
							);
						})()
					}
				</form.Subscribe>

				<form.Subscribe selector={(state) => state.values.revenues}>
					{(revenues) =>
						(() => {
							revenueKeysRef.current = syncRowKeys(
								revenueKeysRef.current,
								revenues,
								"revenue",
							);

							return (
								<section className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-3">
										<h3 className="text-sm font-semibold">Receitas</h3>
										<Button
											size="sm"
											variant="secondary"
											type="button"
											onPress={() => {
												revenueKeysRef.current = [
													...revenueKeysRef.current,
													createRowKey("revenue"),
												];
												form.setFieldValue("revenues", [
													...revenues,
													createEmptyRevenue(),
												]);
											}}
										>
											<PlusIcon size={16} />
											Adicionar receita
										</Button>
									</div>
									{revenues.map((_revenue, index) => (
										<div
											key={revenueKeysRef.current[index]}
											className="rounded-large border border-divider p-3"
										>
											<Field.Group className="grid-cols-[1fr_1fr_auto] items-end">
												<form.AppField
													name={`revenues[${index}].type` as never}
												>
													{(field) => (
														<field.Autocomplete
															label="Tipo de receita"
															options={revenueTypes}
															variant="secondary"
															isRequired
														/>
													)}
												</form.AppField>
												<form.AppField
													name={`revenues[${index}].paymentStartDate` as never}
												>
													{(field) => (
														<field.Input
															label="Início do pagamento"
															type="date"
															variant="secondary"
															isRequired
														/>
													)}
												</form.AppField>
												<Button
													type="button"
													variant="ghost"
													isIconOnly
													aria-label="Remover receita"
													onPress={() => {
														revenueKeysRef.current =
															revenueKeysRef.current.filter(
																(_, currentIndex) => currentIndex !== index,
															);
														form.setFieldValue(
															"revenues",
															revenues.filter(
																(_, currentIndex) => currentIndex !== index,
															),
														);
													}}
												>
													<TrashIcon size={16} />
												</Button>
											</Field.Group>
											<Field.Group className="grid-cols-3">
												<form.AppField
													name={`revenues[${index}].totalValue` as never}
												>
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
												<form.AppField
													name={`revenues[${index}].downPaymentValue` as never}
												>
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
												<form.AppField
													name={`revenues[${index}].totalInstallments` as never}
												>
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
											<form.AppField
												name={`revenues[${index}].isActive` as never}
											>
												{(field) => <field.Checkbox label="Receita ativa" />}
											</form.AppField>
										</div>
									))}
								</section>
							);
						})()
					}
				</form.Subscribe>
			</FormWrapper>
		</form.Form>
	);
};
