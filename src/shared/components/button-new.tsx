import { PlusIcon } from "lucide-react";
import { Button } from "@/shared/components/ui";
import {
	type ClerkPermission,
	hasPermission,
	useOptionalLoggedUserSession,
} from "@/shared/session";

interface ButtonNewProps extends React.ComponentPropsWithoutRef<typeof Button> {
	label?: string;
	permission?: ClerkPermission;
}

export const ButtonNew = ({
	permission,
	label = "Novo",
	size = "sm",
	...props
}: ButtonNewProps) => {
	const session = useOptionalLoggedUserSession();
	if (permission && !hasPermission(session, permission)) {
		return null;
	}
	return (
		<Button size="sm" {...props}>
			<PlusIcon size={16} />
			<span>{label}</span>
		</Button>
	);
};
