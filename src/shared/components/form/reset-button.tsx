import { Button } from "@/shared/components/ui";
import { useFormContext } from "@/shared/hooks/use-app-form";

export const FormResetButton = ({
	children,
	...props
}: React.ComponentPropsWithoutRef<typeof Button>) => {
	const form = useFormContext();

	return (
		<Button variant="ghost" onPress={() => form.reset()} {...props}>
			{children || "Limpar"}
		</Button>
	);
};
