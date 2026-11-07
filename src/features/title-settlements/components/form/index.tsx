import { CatchBoundary } from "@tanstack/react-router";
import { Suspense } from "react";
import { EntityForm } from "@/shared/components/entity-form";
import { FormSection } from "@/shared/components/form-section";
import { Button, FieldGroup, Skeleton } from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { OverlayState } from "@/shared/types/overlay";
import {
	useSettlementOptions,
	useSettlementOptionsRecovery,
} from "../../hooks/use-data";
import { useSettlementForm } from "../../hooks/use-form";
import type { SettlementTargetInput } from "../../schemas/form";

interface SettlementFormProps {
	target: SettlementTargetInput;
	balance: number;
	method: string;
	isContract: boolean;
	state: OverlayState;
}
export function SettlementForm(props: SettlementFormProps) {
	const { resetOptionsError } = useSettlementOptionsRecovery();
	return (
		<CatchBoundary
			getResetKey={() => `${props.target.direction}-${props.target.titleId}`}
			errorComponent={({ reset }) => (
				<EntityForm state={props.state} title="Registrar baixa">
					<div role="alert" className="space-y-3">
						<p>Não foi possível carregar o formulário.</p>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => {
								resetOptionsError();
								reset();
							}}
						>
							Tentar novamente
						</Button>
					</div>
				</EntityForm>
			)}
		>
			<Suspense
				fallback={
					<EntityForm
						state={props.state}
						title={
							props.target.direction === "receivable"
								? "Registrar recebimento"
								: "Registrar pagamento"
						}
						isLoading
						footer={<Skeleton className="h-8 w-28" />}
					>
						<FormSection title="Baixa" variant="plain">
							<FieldGroup className="grid gap-4 sm:grid-cols-2">
								{[0, 1, 2, 3, 4, 5].map((key) => (
									<Skeleton key={key} className="h-14" />
								))}
							</FieldGroup>
						</FormSection>
					</EntityForm>
				}
			>
				<SettlementFormContent {...props} />
			</Suspense>
		</CatchBoundary>
	);
}
function SettlementFormContent({
	target,
	balance,
	method,
	isContract,
	state,
}: SettlementFormProps) {
	const { methods } = useSettlementOptions(target);
	const { form } = useSettlementForm({
		target,
		balance,
		method: methods.some((item) => item.value === method) ? method : "",
		isContract,
		onSuccess: state.close,
	});
	return (
		<form.Form form={form}>
			<EntityForm
				state={state}
				title={
					target.direction === "receivable"
						? "Registrar recebimento"
						: "Registrar pagamento"
				}
				footer={<form.Submit>Confirmar baixa</form.Submit>}
			>
				<FormSection title="Baixa" variant="plain">
					<p className="text-sm">
						Título #{target.titleId} • Saldo: {formatter.currency(balance)}
					</p>
					<FieldGroup className="grid gap-4 sm:grid-cols-2">
						<form.AppField name="effectiveDate">
							{(field) => <field.DatePicker label="Data efetiva" isRequired />}
						</form.AppField>
						<form.AppField name="actualPaymentMethod">
							{(field) => (
								<field.Autocomplete
									label="Meio de pagamento real"
									options={methods}
									isRequired
								/>
							)}
						</form.AppField>
						{(
							[
								["principalAbated", "Principal abatido"],
								["discount", "Desconto"],
								["interest", "Juros"],
								["penalty", "Multa"],
							] as const
						).map(([name, label]) => (
							<form.AppField key={name} name={name}>
								{(field) => (
									<field.Number
										label={label}
										minValue={name === "principalAbated" ? 0.01 : 0}
										maxValue={
											name === "principalAbated" ? balance : 999_999_999_999.99
										}
										step={0.01}
										formatOptions={{ style: "currency", currency: "BRL" }}
										isRequired
									/>
								)}
							</form.AppField>
						))}
					</FieldGroup>
					{target.direction === "receivable" && isContract && (
						<form.AppField name="generatesRemuneration">
							{(field) => <field.Checkbox label="Gerar remunerações" />}
						</form.AppField>
					)}
					<form.Subscribe selector={(value) => value.values}>
						{(value) => (
							<p className="text-sm font-medium" aria-live="polite">
								Caixa efetivo:{" "}
								{formatter.currency(
									Math.round(
										(value.principalAbated -
											value.discount +
											value.interest +
											value.penalty) *
											100,
									) / 100,
								)}
							</p>
						)}
					</form.Subscribe>
				</FormSection>
			</EntityForm>
		</form.Form>
	);
}
