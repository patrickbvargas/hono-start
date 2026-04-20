import type { AnyFormApi } from "@tanstack/react-form-start";
import { Form, type FormProps } from "@/shared/components/ui";
import { formContext } from "@/shared/hooks/use-app-form";
import { FormDebug } from "./debug";

interface FormRootProps extends FormProps {
	form: AnyFormApi;
	showDebug?: boolean;
}

export const FormRoot = ({
	form,
	validationBehavior = "aria",
	children,
	showDebug = false,
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
				{showDebug && <FormDebug form={form} />}
			</Form>
		</formContext.Provider>
	);
};
