import { Button, Spinner } from "@/shared/components/ui";
import { useFormContext } from "@/shared/hooks/use-app-form";

interface FormSubmitButtonProps
	extends React.ComponentPropsWithoutRef<typeof Button> {
	isLoading?: boolean;
}

export const FormSubmitButton = ({
	children,
	disabled,
	isLoading = false,
	...props
}: FormSubmitButtonProps) => {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					type="submit"
					onClick={form.handleSubmit}
					disabled={disabled || isLoading || isSubmitting}
					{...props}
				>
					{(isLoading || isSubmitting) && (
						<Spinner className="size-4" aria-hidden="true" />
					)}
					<span>{children || "Salvar"}</span>
				</Button>
			)}
		</form.Subscribe>
	);
};
