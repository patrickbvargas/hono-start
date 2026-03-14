import {
	createFormHook,
	createFormHookContexts,
} from "@tanstack/react-form-start";
import {
	FormAutocomplete,
	FormCheckbox,
	FormCheckboxGroup,
	FormDatePicker,
	FormInput,
	FormInputOTP,
	FormMultiselect,
	FormNumber,
	FormRadioGroup,
	FormResetButton,
	FormRoot,
	FormSubmitButton,
	FormSwitch,
	FormTextArea,
} from "../components/form";

export const { fieldContext, formContext, useFormContext, useFieldContext } =
	createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		Input: FormInput,
		InputOTP: FormInputOTP,
		Number: FormNumber,
		Textarea: FormTextArea,
		Checkbox: FormCheckbox,
		CheckboxGroup: FormCheckboxGroup,
		Autocomplete: FormAutocomplete,
		Multiselect: FormMultiselect,
		RadioGroup: FormRadioGroup,
		Switch: FormSwitch,
		DatePicker: FormDatePicker,
	},
	formComponents: {
		Form: FormRoot,
		Submit: FormSubmitButton,
		Reset: FormResetButton,
	},
});
