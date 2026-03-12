import { useFormContext } from "@/shared/hooks/use-app-form";
import { Button } from "../../ui/button";

export const FormResetButton = ({
	children,
	...props
}: React.ComponentPropsWithoutRef<typeof Button>) => {
	const form = useFormContext();

	return (
		<Button variant="ghost" onClick={() => form.reset()} {...props}>
			{children || "Limpar"}
		</Button>
	);
};
