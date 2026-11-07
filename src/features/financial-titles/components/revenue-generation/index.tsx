import { PlusIcon, Trash2Icon } from "lucide-react";
import { Suspense } from "react";
import { EntityForm } from "@/shared/components/entity-form";
import { FormFieldSkeleton } from "@/shared/components/form-field-skeleton";
import { FormSection } from "@/shared/components/form-section";
import {
	Button,
	FieldError,
	FieldGroup,
	ScrollArea,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { OverlayState } from "@/shared/types/overlay";
import { TITLE_MAX_AMOUNT } from "../../constants/values";
import { useTitleGenerationOptions } from "../../hooks/use-data";
import { useRevenueTitleForm } from "../../hooks/use-form";
import { PreviewBalance } from "./preview-balance";

interface RevenueGenerationFormProps {
	revenueId: number;
	negotiatedAmount: number;
	state: OverlayState;
	onSuccess?: () => void | Promise<void>;
}
const kindOptions = [
	{ value: "DOWN_PAYMENT", label: "Entrada" },
	{ value: "INSTALLMENT", label: "Parcela" },
	{ value: "EXTRA", label: "Extra" },
];

export function RevenueGenerationForm(props: RevenueGenerationFormProps) {
	return (
		<Suspense fallback={<RevenueGenerationSkeleton state={props.state} />}>
			<RevenueGenerationContent {...props} />
		</Suspense>
	);
}

function RevenueGenerationContent({
	revenueId,
	negotiatedAmount,
	state,
	onSuccess,
}: RevenueGenerationFormProps) {
	const { analytics, paymentMethods } = useTitleGenerationOptions();
	const { form, getRowKey, addTitle, removeTitle } = useRevenueTitleForm({
		revenueId,
		negotiatedAmount,
		onSuccess,
	});
	return (
		<form.Form form={form}>
			<EntityForm
				state={state}
				title="Gerar parcelas"
				contentClassName="sm:max-w-5xl"
				footer={<form.Submit />}
			>
				<FormSection title="Parcelamento" variant="plain">
					<p className="text-sm">
						Valor negociado: {formatter.currency(negotiatedAmount)}. A prévia
						atualiza automaticamente ao alterar os dados do parcelamento.
					</p>
					<FieldGroup className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<form.AppField name="downPaymentAmount">
							{(field) => (
								<field.Number
									label="Entrada"
									minValue={0}
									maxValue={negotiatedAmount}
									step={0.01}
									formatOptions={{ style: "currency", currency: "BRL" }}
								/>
							)}
						</form.AppField>
						<form.AppField name="downPaymentDueDate">
							{(field) => <field.DatePicker label="Vencimento da entrada" />}
						</form.AppField>
						<form.AppField name="installmentCount">
							{(field) => (
								<field.Number
									label="Quantidade de parcelas"
									minValue={1}
									step={1}
									isRequired
								/>
							)}
						</form.AppField>
						<form.AppField name="firstDueDate">
							{(field) => (
								<field.DatePicker label="Primeiro vencimento" isRequired />
							)}
						</form.AppField>
						<form.AppField name="analytic">
							{(field) => (
								<field.Autocomplete
									label="Categoria financeira"
									classNames={{ wrapper: "lg:col-span-2" }}
									options={analytics}
									isRequired
								/>
							)}
						</form.AppField>
						<form.AppField name="expectedPaymentMethod">
							{(field) => (
								<field.Autocomplete
									label="Forma de pagamento prevista"
									classNames={{ wrapper: "lg:col-span-2" }}
									options={paymentMethods}
									isRequired
								/>
							)}
						</form.AppField>
					</FieldGroup>
				</FormSection>
				<form.AppField name="titles" mode="array">
					{(array) => (
						<FormSection
							title="Prévia dos títulos"
							variant="plain"
							action={
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={addTitle}
								>
									<PlusIcon />
									Adicionar título
								</Button>
							}
						>
							{array.state.meta.errors.length > 0 && (
								<FieldError errors={array.state.meta.errors} />
							)}
							<ScrollArea className="w-full min-w-0 rounded-lg border">
								<Table
									className="min-w-[880px]"
									aria-label="Prévia dos títulos"
								>
									<TableHeader>
										<TableRow>
											<TableHead scope="col">Título</TableHead>
											<TableHead scope="col">Tipo</TableHead>
											<TableHead scope="col">Vencimento</TableHead>
											<TableHead scope="col">Categoria financeira</TableHead>
											<TableHead scope="col">Forma de pagamento</TableHead>
											<TableHead scope="col">Valor</TableHead>
											<TableHead scope="col">
												<span className="sr-only">Ações</span>
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{array.state.value.length === 0 && (
											<TableRow>
												<TableCell
													colSpan={7}
													className="h-20 text-center text-muted-foreground"
												>
													Preencha os dados do parcelamento para visualizar os
													títulos.
												</TableCell>
											</TableRow>
										)}
										{array.state.value.map((_, index) => (
											<TableRow
												key={getRowKey(index)}
												className="[&>td]:align-top [&_label]:sr-only"
											>
												<TableCell className="pt-4">{index + 1}</TableCell>
												<TableCell className="min-w-32">
													<form.AppField name={`titles[${index}].kind`}>
														{(field) => (
															<field.Autocomplete
																label={`Tipo do título ${index + 1}`}
																options={kindOptions}
																isRequired
															/>
														)}
													</form.AppField>
												</TableCell>
												<TableCell className="min-w-40">
													<form.AppField name={`titles[${index}].dueDate`}>
														{(field) => (
															<field.DatePicker
																label={`Vencimento do título ${index + 1}`}
																isRequired
															/>
														)}
													</form.AppField>
												</TableCell>
												<TableCell className="min-w-44">
													<form.AppField name={`titles[${index}].analytic`}>
														{(field) => (
															<field.Autocomplete
																label={`Categoria financeira do título ${index + 1}`}
																options={analytics}
																isRequired
															/>
														)}
													</form.AppField>
												</TableCell>
												<TableCell className="min-w-44">
													<form.AppField
														name={`titles[${index}].expectedPaymentMethod`}
													>
														{(field) => (
															<field.Autocomplete
																label={`Forma de pagamento do título ${index + 1}`}
																options={paymentMethods}
																isRequired
															/>
														)}
													</form.AppField>
												</TableCell>
												<TableCell className="min-w-36">
													<form.AppField name={`titles[${index}].amount`}>
														{(field) => (
															<field.Number
																label={`Valor do título ${index + 1}`}
																minValue={0.01}
																maxValue={TITLE_MAX_AMOUNT}
																step={0.01}
																formatOptions={{
																	style: "currency",
																	currency: "BRL",
																}}
																isRequired
															/>
														)}
													</form.AppField>
												</TableCell>
												<TableCell>
													<Button
														type="button"
														size="icon"
														variant="outline"
														aria-label={`Remover título ${index + 1}`}
														onClick={() => removeTitle(index)}
													>
														<Trash2Icon />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</ScrollArea>
							<form.Subscribe selector={(value) => value.values.titles}>
								{(titles) => (
									<PreviewBalance
										titles={titles}
										negotiatedAmount={negotiatedAmount}
									/>
								)}
							</form.Subscribe>
						</FormSection>
					)}
				</form.AppField>
			</EntityForm>
		</form.Form>
	);
}

function RevenueGenerationSkeleton({ state }: { state: OverlayState }) {
	return (
		<EntityForm
			state={state}
			title="Gerar parcelas"
			contentClassName="sm:max-w-5xl"
			isLoading
			footer={<Skeleton className="h-8 w-16" />}
		>
			<FormSection title="Parcelamento" variant="plain">
				<FieldGroup className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{[
						"entry",
						"entry-date",
						"count",
						"first-date",
						"analytic",
						"method",
					].map((key) => (
						<FormFieldSkeleton
							key={key}
							className={
								key === "analytic" || key === "method"
									? "lg:col-span-2"
									: undefined
							}
						/>
					))}
				</FieldGroup>
			</FormSection>
			<FormSection title="Prévia dos títulos" variant="plain">
				<Skeleton className="h-28 w-full" />
			</FormSection>
		</EntityForm>
	);
}
