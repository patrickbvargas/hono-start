import type { MouseEvent, ReactNode } from "react";
import { TableButton } from "@/shared/components/table-button";
import type { EntityId } from "@/shared/schemas/entity";

interface EntityIdTriggerProps {
	id: EntityId;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	label?: string;
	actionLabel?: string;
}

export function EntityIdTrigger({
	id,
	onOpenPage,
	onView,
	label,
	actionLabel,
}: EntityIdTriggerProps): ReactNode {
	return (
		<TableButton
			className={
				label
					? "max-w-full whitespace-normal"
					: "font-mono text-muted-foreground hover:text-foreground"
			}
			aria-label={
				actionLabel ??
				(onOpenPage
					? `Abrir página de ${label ?? `registro #${id}`}`
					: label
						? `Ver detalhes de ${label}`
						: `Ver detalhes do registro #${id}`)
			}
			title={actionLabel}
			onClick={(event: MouseEvent<HTMLButtonElement>) => {
				event.stopPropagation();
				(onOpenPage ?? onView)?.(id);
			}}
		>
			{label ?? `#${id}`}
		</TableButton>
	);
}
