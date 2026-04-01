import { Form, type FormProps } from "@heroui/react";
import type { AnyFormApi } from "@tanstack/react-form-start";
import { formContext } from "@/shared/hooks/use-app-form";

interface FormRootProps extends FormProps {
	form: AnyFormApi;
}

export const FormRoot = ({
	form,
	validationBehavior = "aria",
	children,
	...props
}: FormRootProps) => {
	return (
		<formContext.Provider value={form}>
			<Form
				id={form.formId}
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				validationBehavior={validationBehavior}
				{...props}
			>
				{children}
			</Form>
		</formContext.Provider>
	);
};
