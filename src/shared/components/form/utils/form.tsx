import type { AnyFormApi } from "@tanstack/react-form-start";
import { formContext } from "@/shared/hooks/use-app-form";

interface FormRootProps extends React.ComponentProps<"form"> {
	form: AnyFormApi;
}

export function FormRoot({ form, children, ...props }: FormRootProps) {
	return (
		<formContext.Provider value={form}>
			<form
				{...props}
				noValidate
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
			>
				{children}
			</form>
		</formContext.Provider>
	);
}
