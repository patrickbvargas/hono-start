import { Temporal } from "@js-temporal/polyfill";
import { useStore } from "@tanstack/react-form-start";
import z from "zod";
import type { FieldOption } from "@/shared/components/form/types";
import { Button } from "@/shared/components/ui/button";
import { useAppForm } from "@/shared/hooks/use-app-form";

const formSchema = z.object({
	input: z.string().min(1, "Input is required"),
	inputOTP: z.string().min(1, "InputOTP is required"),
	textarea: z.string().min(1, "Textarea is required"),
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
	datePicker: z.instanceof(Temporal.PlainDate, {
		error: "DatePicker é obrigatório",
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
	datePicker: Temporal.PlainDate.from({ year: 2023, month: 1, day: 1 }),
};

const defaultOptions: FieldOption[] = [
	{ value: "1", label: "Opt A" },
	{ value: "2", label: "Opt B" },
	{ value: "3", label: "Opt C" },
];

export const EmployeeForm = () => {
	const form = useAppForm({
		defaultValues: formDefaultValues,
		validators: { onSubmit: formSchema },
		onSubmit: ({ value }) => {
			alert(JSON.stringify(formSchema.parse(value), null, 2));
		},
	});

	const values = useStore(form.store, (state) => state.values);
	const errors = useStore(form.store, (state) => state.errors);

	return (
		<div>
			<pre>{JSON.stringify(values, null, 2)}</pre>
			<pre className="text-destructive">{JSON.stringify(errors)}</pre>
			<div className="grid grid-cols-2 gap-3">
				<form.AppField
					name="datePicker"
					children={(field) => (
						<field.DatePicker
							label="DatePicker"
							description="DatePicker description"
						/>
					)}
				/>
				<form.AppField
					name="input"
					children={(field) => (
						<field.Input label="Input" description="Input description" />
					)}
				/>
				<form.AppField
					name="inputOTP"
					children={(field) => (
						<field.InputOTP
							label="InputOTP"
							description="InputOTP description"
							maxLength={3}
						/>
					)}
				/>
				<form.AppField
					name="textarea"
					children={(field) => (
						<field.Input label="Textarea" description="Textarea description" />
					)}
				/>
				<form.AppField
					name="autocomplete"
					children={(field) => (
						<field.Autocomplete
							label="Autocomplete"
							description="Autocomplete description"
							options={defaultOptions}
						/>
					)}
				/>
				<form.AppField
					name="checkbox"
					children={(field) => <field.Checkbox label="Checkbox" />}
				/>
				<form.AppField
					name="switch"
					children={(field) => <field.Switch label="Switch" />}
				/>
				<form.AppField
					name="checkboxGroup"
					children={(field) => (
						<field.CheckboxGroup
							label="CheckboxGroup"
							description="CheckboxGroup description"
							options={defaultOptions}
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
						/>
					)}
				/>
				<Button onClick={() => form.handleSubmit()}>Submit</Button>
			</div>
		</div>
	);
};
