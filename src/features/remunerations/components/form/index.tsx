import { Suspense } from "react";
import { EntityForm } from "@/shared/components/entity-form";
import { FormFieldSkeleton } from "@/shared/components/form-field-skeleton";
import { FieldGroup, Skeleton } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemuneration } from "../../hooks/use-data";
import { useRemunerationForm } from "../../hooks/use-form";

interface RemunerationFormProps {
	id: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const RemunerationForm = ({
	id,
	state,
	onSuccess,
}: RemunerationFormProps) => {
	return (
		<Suspense fallback={<RemunerationFormSkeleton state={state} />}>
			<RemunerationFormContent id={id} state={state} onSuccess={onSuccess} />
		</Suspense>
	);
};

function RemunerationFormContent({
	id,
	state,
	onSuccess,
}: RemunerationFormProps) {
	const { remuneration } = useRemuneration(id);
	const { form } = useRemunerationForm({
		id,
		initialValue: remuneration,
		onSuccess,
	});

	return (
		<form.Form form={form}>
			<EntityForm
				state={state}
				title="Editar remuneração"
				footer={<form.Submit />}
			>
				<FieldGroup className="grid gap-5 sm:grid-cols-2">
					<form.AppField name="amount">
						{(field) => (
							<field.Number
								label="Valor"
								minValue={0}
								step={100}
								isRequired
								formatOptions={{
									style: "currency",
									currency: "BRL",
								}}
							/>
						)}
					</form.AppField>
					<form.AppField name="effectivePercentage">
						{(field) => (
							<field.Number
								label="Percentual efetivo"
								minValue={0}
								maxValue={1}
								step={0.01}
								isRequired
								formatOptions={{ style: "percent" }}
							/>
						)}
					</form.AppField>
				</FieldGroup>
			</EntityForm>
		</form.Form>
	);
}

function RemunerationFormSkeleton({
	state,
}: Pick<RemunerationFormProps, "state">) {
	return (
		<EntityForm
			state={state}
			title="Editar remuneração"
			footer={<Skeleton className="h-9 w-28 rounded-md" />}
		>
			<FieldGroup className="grid gap-5 sm:grid-cols-2">
				<FormFieldSkeleton labelWidth="w-10" />
				<FormFieldSkeleton labelWidth="w-28" />
			</FieldGroup>
		</EntityForm>
	);
}
