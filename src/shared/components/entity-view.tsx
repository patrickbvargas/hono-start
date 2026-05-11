import { ListIcon, Table2Icon } from "lucide-react";
import type * as React from "react";
import { Button, ButtonGroup } from "@/shared/components/ui";
import type { EntityViewMode } from "@/shared/hooks/use-entity-view-mode";
import { useEntityViewMode } from "@/shared/hooks/use-entity-view-mode";
import { cn } from "@/shared/lib/utils";

interface EntityViewProps {
	className?: string;
	defaultMode?: EntityViewMode;
	list: React.ReactNode;
	mobileMode?: EntityViewMode;
	storageKey?: string;
	table: React.ReactNode;
}

interface EntityViewToggleProps
	extends React.ComponentPropsWithoutRef<typeof ButtonGroup> {
	className?: string;
	defaultMode?: EntityViewMode;
	mobileMode?: EntityViewMode;
	storageKey?: string;
}

function EntityViewRoot({
	className,
	defaultMode,
	list,
	mobileMode,
	storageKey,
	table,
}: EntityViewProps) {
	const { activeViewMode } = useEntityViewMode({
		defaultMode,
		mobileMode,
		storageKey,
	});

	return (
		<div className={cn("min-h-0 flex-1", className)}>
			{activeViewMode === "list" ? list : table}
		</div>
	);
}

function EntityViewToggle({
	defaultMode,
	mobileMode,
	storageKey,
	...props
}: EntityViewToggleProps) {
	const { activeViewMode, isMobile, setPreferredViewMode } = useEntityViewMode({
		defaultMode,
		mobileMode,
		storageKey,
	});

	if (isMobile) {
		return null;
	}

	return (
		<ButtonGroup {...props}>
			<Button
				type="button"
				variant="outline"
				className={cn(activeViewMode !== "table" && "text-muted-foreground")}
				onClick={() => setPreferredViewMode("table")}
			>
				<Table2Icon />
				<span className="sr-only">Tabela</span>
			</Button>
			<Button
				type="button"
				variant="outline"
				className={cn(activeViewMode !== "list" && "text-muted-foreground")}
				onClick={() => setPreferredViewMode("list")}
			>
				<ListIcon />
				<span className="sr-only">Cards</span>
			</Button>
		</ButtonGroup>
	);
}

export const EntityView = Object.assign(EntityViewRoot, {
	Toggle: EntityViewToggle,
});
