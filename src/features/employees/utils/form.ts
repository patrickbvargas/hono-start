import { formOptions } from "@tanstack/react-form-start";
import { employeeFormSchema } from "../schemas/form";
import type { Employee } from "../schemas/model";
import { defaultFormCreateValues, defaultFormUpdateValues } from "./default";

export const formEmployeeOptions = (initialValue?: Employee) => {
	if (initialValue)
		return formOptions({
			defaultValues: defaultFormUpdateValues(initialValue),
			validators: { onSubmit: employeeFormSchema },
			onSubmit: ({ value }) => {
				// mutation update
				alert(JSON.stringify(employeeFormSchema.parse(value), null, 2));
			},
		});

	return formOptions({
		defaultValues: defaultFormCreateValues(),
		validators: { onSubmit: employeeFormSchema },
		onSubmit: ({ value }) => {
			// mutation create
			alert(JSON.stringify(employeeFormSchema.parse(value), null, 2));
		},
	});
};
