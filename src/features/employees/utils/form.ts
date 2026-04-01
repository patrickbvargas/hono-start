import { formOptions } from "@tanstack/react-form-start";
import { employeeCreateSchema, employeeUpdateSchema } from "../schemas/form";
import type { Employee } from "../schemas/model";
import { defaultFormCreateValues, defaultFormUpdateValues } from "./default";

// TODO: refatorar
export const formEmployeeOptions = (initialValue?: Employee) => {
	if (initialValue)
		return formOptions({
			defaultValues: defaultFormUpdateValues(initialValue),
			validators: { onSubmit: employeeUpdateSchema },
			onSubmit: ({ value }) => {
				// mutation update
				alert(JSON.stringify(employeeCreateSchema.parse(value), null, 2));
			},
		});

	return formOptions({
		defaultValues: defaultFormCreateValues(),
		validators: { onSubmit: employeeCreateSchema },
		onSubmit: ({ value }) => {
			// mutation create
			alert(JSON.stringify(employeeCreateSchema.parse(value), null, 2));
		},
	});
};
