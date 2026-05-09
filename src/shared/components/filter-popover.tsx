import { Settings2Icon } from "lucide-react";
import type * as React from "react";
import {
	Button,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui";

interface FilterPopoverProps extends React.ComponentProps<typeof Popover> {
	children: React.ReactNode;
	hasActiveIndicator?: boolean;
	showActiveIndicator?: boolean;
}

export const FilterPopover = ({
	children,
	hasActiveIndicator = false,
	showActiveIndicator = false,
	...props
}: FilterPopoverProps) => {
	return (
		<Popover {...props}>
			<PopoverTrigger render={<Button variant="outline" />}>
				<span className="relative inline-flex items-center gap-2">
					<Settings2Icon size={16} />
					Filtros
					{showActiveIndicator && hasActiveIndicator ? (
						<span
							data-slot="filter-popover-indicator"
							aria-hidden="true"
							className="absolute -top-0.5 -right-1.5 inline-flex size-2 rounded-full bg-primary ring-2 ring-background"
						/>
					) : null}
				</span>
			</PopoverTrigger>
			<PopoverContent align="end" side="bottom" className="space-y-3 p-4">
				{children}
			</PopoverContent>
		</Popover>
	);
};
