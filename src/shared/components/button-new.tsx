import { PlusIcon } from "lucide-react";
import { Button } from "@/shared/components/ui";

interface ButtonNewProps extends React.ComponentPropsWithoutRef<typeof Button> {
	label?: string;
}

export const ButtonNew = ({
	label = "Novo",
	size = "sm",
	...props
}: ButtonNewProps) => {
	return (
		<Button size="sm" {...props}>
			<PlusIcon size={16} />
			<span className="sm:hidden">Novo</span>
			<span className="hidden sm:inline">{label}</span>
		</Button>
	);
};
