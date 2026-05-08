import {
	createFormHook,
	createFormHookContexts,
} from "@tanstack/react-form-start";
import {
	FormAutocomplete,
	FormCheckbox,
	FormCheckboxGroup,
	FormDatePicker,
	FormFile,
	FormInput,
	FormInputOTP,
	FormMultiselect,
	FormNumber,
	FormRadioGroup,
	FormResetButton,
	FormRoot,
	FormSearch,
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
		File: FormFile,
		Search: FormSearch,
	},
	formComponents: {
		Form: FormRoot,
		Submit: FormSubmitButton,
		Reset: FormResetButton,
	},
});
