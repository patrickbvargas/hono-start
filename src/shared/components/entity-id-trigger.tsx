import { ArrowUpRightIcon } from "lucide-react";
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
	label,
	actionLabel,
}: EntityIdTriggerProps): ReactNode {
	const handler = label ? onOpenPage : undefined;
	const description =
		actionLabel ?? `Abrir página de ${label ?? `registro #${id}`}`;
	if (!handler)
		return (
			<span className={label ? undefined : "font-mono text-muted-foreground"}>
				{label ?? `#${id}`}
			</span>
		);
	return (
		<TableButton
			className={
				label
					? "inline-flex max-w-full items-baseline gap-1 whitespace-normal"
					: "font-mono text-muted-foreground hover:text-foreground"
			}
			aria-label={description}
			title={description}
			onClick={(event: MouseEvent<HTMLButtonElement>) => {
				event.stopPropagation();
				handler(id);
			}}
		>
			<span className="min-w-0 wrap-break-word">{label}</span>
			<ArrowUpRightIcon
				aria-hidden="true"
				className="relative top-0.5 size-3.5 shrink-0"
			/>
		</TableButton>
	);
}
