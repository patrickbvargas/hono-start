import type { MouseEvent, ReactNode } from "react";
import { Button } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";

interface EntityIdTriggerProps {
	id: EntityId;
	onView?: (id: EntityId) => void;
}

export function EntityIdTrigger({
	id,
	onView,
}: EntityIdTriggerProps): ReactNode {
	return (
		<Button
			variant="link"
			size="sm"
			className="h-auto cursor-pointer px-0 font-mono text-muted-foreground no-underline underline-offset-4 hover:text-foreground hover:underline"
			aria-label={`Visualizar detalhes do registro #${id}`}
			onClick={(event: MouseEvent<HTMLButtonElement>) => {
				event.stopPropagation();
				onView?.(id);
			}}
		>
			#{id}
		</Button>
	);
}
