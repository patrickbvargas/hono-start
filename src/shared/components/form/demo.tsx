import { CalendarDate, parseDate } from "@internationalized/date";
import * as z from "zod";
import { useAppForm } from "@/shared/hooks/use-app-form";
import type { FieldOption } from "@/shared/types/field";

const formSchema = z.object({
	input: z.string().min(1, "Input is required"),
	inputOTP: z.string().min(1, "InputOTP is required"),
	textarea: z.string().min(1, "Textarea is required"),
	number: z.number().min(1, "Number is required"),
	autocomplete: z.coerce.number<number>().min(1, "Autocomplete is required"),
	checkbox: z.boolean().refine((value) => value, "Checkbox is required"),
	switch: z.boolean().refine((value) => value, "Switch is required"),
	checkboxGroup: z.coerce
		.number<number>()
		.array()
		.min(1, "CheckboxGroup is required"),
	multiselect: z.coerce
		.number<number>()
		.array()
		.min(1, "Multiselect is required"),
	radioGroup: z.coerce.number<number>().min(1, "RadioGroup is required"),
	datePicker: z
		.instanceof(CalendarDate, {
			error: "DatePicker é obrigatório",
		})
		.refine((value) => value.compare(parseDate("2025-01-01")) > 0, {
			message: "DatePicker deve ser posterior à 2025-01-01",
		}),
});
type Form = z.infer<typeof formSchema>;

const formDefaultValues: Form = {
	input: "",
	inputOTP: "",
	textarea: "",
	checkbox: true,
	switch: true,
	checkboxGroup: [],
	multiselect: [],
	autocomplete: 0,
	radioGroup: 0,
	number: 0,
	datePicker: parseDate("2023-01-01"),
};

const defaultOptions: FieldOption[] = [
	{ id: 1, label: "Opt A" },
	{ id: 2, label: "Opt B" },
	{ id: 3, label: "Opt C" },
];

export const DemoForm = () => {
	const form = useAppForm({
		defaultValues: formDefaultValues,
		validators: { onSubmit: formSchema },
		onSubmit: ({ value }) => {
			alert(JSON.stringify(formSchema.parse(value), null, 2));
		},
	});

	return (
		<form.Form form={form} className="grid grid-cols-2 gap-3">
			<form.AppField
				name="datePicker"
				children={(field) => (
					<field.DatePicker
						label="DatePicker"
						description="DatePicker description"
						isRequired
					/>
				)}
			/>
			<form.AppField
				name="input"
				children={(field) => (
					<field.Input
						label="Input"
						description="Input description"
						isRequired
					/>
				)}
			/>
			<form.AppField
				name="inputOTP"
				children={(field) => (
					<field.InputOTP
						label="InputOTP"
						description="InputOTP description"
						maxLength={6}
						isRequired
					/>
				)}
			/>
			<form.AppField
				name="textarea"
				children={(field) => (
					<field.Textarea
						label="Textarea"
						description="Textarea description"
						isRequired
					/>
				)}
			/>
			<form.AppField
				name="number"
				children={(field) => (
					<field.Number
						label="Number"
						description="Number description"
						isRequired
					/>
				)}
			/>
			<form.AppField
				name="autocomplete"
				children={(field) => (
					<field.Autocomplete
						label="Autocomplete"
						description="Autocomplete description"
						options={defaultOptions}
						isRequired
					/>
				)}
			/>
			<form.AppField
				name="checkbox"
				children={(field) => <field.Checkbox label="Checkbox" isRequired />}
			/>
			<form.AppField
				name="switch"
				children={(field) => <field.Switch label="Switch" isRequired />}
			/>
			<form.AppField
				name="checkboxGroup"
				children={(field) => (
					<field.CheckboxGroup
						label="CheckboxGroup"
						description="CheckboxGroup description"
						options={defaultOptions}
						isRequired
					/>
				)}
			/>
			<form.AppField
				name="multiselect"
				children={(field) => (
					<field.Multiselect
						label="Multiselect"
						description="Multiselect description"
						options={defaultOptions}
						isRequired
					/>
				)}
			/>
			<form.AppField
				name="radioGroup"
				children={(field) => (
					<field.RadioGroup
						label="RadioGroup"
						description="RadioGroup description"
						options={defaultOptions}
						isRequired
					/>
				)}
			/>
			<form.AppForm>
				<form.Reset />
				<form.Submit />
			</form.AppForm>
		</form.Form>
	);
};
