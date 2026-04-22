import { Settings2Icon } from "lucide-react";
import type * as React from "react";
import {
	Button,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui";

interface FilterWrapperProps extends React.ComponentProps<typeof Popover> {
	children: React.ReactNode;
}

export const FilterWrapper = ({ children, ...props }: FilterWrapperProps) => {
	return (
		<Popover {...props}>
			<PopoverTrigger render={<Button variant="ghost" />}>
				<Settings2Icon size={16} />
				Filtros
			</PopoverTrigger>
			<PopoverContent align="end" side="bottom" className="space-y-3 p-4">
				{children}
			</PopoverContent>
		</Popover>
	);
};
