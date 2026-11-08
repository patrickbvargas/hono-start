import { ListIcon, Table2Icon } from "lucide-react";
import type * as React from "react";
import {
	Button,
	ButtonGroup,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui";
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
	defaultMode?: EntityViewMode;
	mobileMode?: EntityViewMode;
	storageKey?: string;
}

function EntityViewRoot({
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

	return activeViewMode === "list" ? list : table;
}

function EntityViewToggle({
	className,
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
		<ButtonGroup className={cn("ml-auto", className)} {...props}>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							type="button"
							variant="outline"
							className={cn(
								activeViewMode !== "table" && "text-muted-foreground",
							)}
							onClick={() => setPreferredViewMode("table")}
						/>
					}
				>
					<Table2Icon />
					<span className="sr-only">Tabela</span>
				</TooltipTrigger>
				<TooltipContent>Tabela</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							type="button"
							variant="outline"
							className={cn(
								activeViewMode !== "list" && "text-muted-foreground",
							)}
							onClick={() => setPreferredViewMode("list")}
						/>
					}
				>
					<ListIcon />
					<span className="sr-only">Cards</span>
				</TooltipTrigger>
				<TooltipContent>Cards</TooltipContent>
			</Tooltip>
		</ButtonGroup>
	);
}

export const EntityView = Object.assign(EntityViewRoot, {
	Toggle: EntityViewToggle,
});
