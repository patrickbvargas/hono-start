import { Button } from "@/shared/components/ui";
import { useFormContext } from "@/shared/hooks/use-app-form";

export const FormSubmitButton = ({
	children,
	...props
}: React.ComponentPropsWithoutRef<typeof Button>) => {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" isDisabled={isSubmitting} {...props}>
					{children || "Salvar"}
				</Button>
			)}
		</form.Subscribe>
	);
};
