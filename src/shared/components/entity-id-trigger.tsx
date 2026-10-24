import type { MouseEvent, ReactNode } from "react";
import { TableButton } from "@/shared/components/table-button";
import type { EntityId } from "@/shared/schemas/entity";

interface EntityIdTriggerProps {
	id: EntityId;
	onView?: (id: EntityId) => void;
	label?: string;
}

export function EntityIdTrigger({
	id,
	onView,
	label,
}: EntityIdTriggerProps): ReactNode {
	return (
		<TableButton
			className={
				label
					? "max-w-full whitespace-normal"
					: "font-mono text-muted-foreground hover:text-foreground"
			}
			aria-label={
				label ? `Ver detalhes de ${label}` : `Ver detalhes do registro #${id}`
			}
			onClick={(event: MouseEvent<HTMLButtonElement>) => {
				event.stopPropagation();
				onView?.(id);
			}}
		>
			{label ?? `#${id}`}
		</TableButton>
	);
}
