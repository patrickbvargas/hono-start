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
	FormRadioGroup,
	FormSwitch,
	FormTextArea,
} from "../components/form";

export const { fieldContext, formContext, useFieldContext } =
	createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		Input: FormInput,
		InputOTP: FormInputOTP,
		Textarea: FormTextArea,
		Checkbox: FormCheckbox,
		CheckboxGroup: FormCheckboxGroup,
		Autocomplete: FormAutocomplete,
		Multiselect: FormMultiselect,
		RadioGroup: FormRadioGroup,
		Switch: FormSwitch,
		DatePicker: FormDatePicker,
	},
	formComponents: {},
});
