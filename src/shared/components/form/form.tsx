import type { AnyFormApi } from "@tanstack/react-form-start";
import { formContext } from "@/shared/hooks/use-app-form";
import { FormDebug } from "./debug";

interface FormRootProps extends React.ComponentProps<"form"> {
	form: AnyFormApi;
	showDebug?: boolean;
}

export const FormRoot = ({
	form,
	children,
	showDebug = false,
	method = "post",
	...props
}: FormRootProps) => {
	return (
		<formContext.Provider value={form}>
			<form
				id={form.formId}
				method={method}
				noValidate
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				{...props}
			>
				{children}
				{showDebug && <FormDebug form={form} />}
			</form>
		</formContext.Provider>
	);
};
