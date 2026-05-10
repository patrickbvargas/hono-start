import { PlusIcon } from "lucide-react";
import { Button } from "@/shared/components/ui";

export const ButtonNew = ({
	size = "sm",
	...props
}: React.ComponentPropsWithoutRef<typeof Button>) => {
	return (
		<Button size="sm" {...props}>
			<PlusIcon size={16} />
			Novo
		</Button>
	);
};
