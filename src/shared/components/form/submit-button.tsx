import { useFormContext } from "@/shared/hooks/use-app-form";
import { Button } from "../ui/button";

export const FormSubmitButton = ({
	children,
	...props
}: React.ComponentPropsWithoutRef<typeof Button>) => {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					type="submit"
					onClick={form.handleSubmit}
					disabled={isSubmitting}
					{...props}
				>
					{children || "Salvar"}
				</Button>
			)}
		</form.Subscribe>
	);
};
