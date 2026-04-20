import { Settings2Icon } from "lucide-react";
import { Button, Popover, type PopoverProps } from "@/shared/components/ui";

export const FilterWrapper = ({ children, ...props }: PopoverProps) => {
	return (
		<Popover {...props}>
			<Popover.Trigger>
				<Button variant="tertiary">
					<Settings2Icon size={16} />
					Filtros
				</Button>
			</Popover.Trigger>
			<Popover.Content placement="bottom end">
				<Popover.Dialog className="space-y-3 p-4">{children}</Popover.Dialog>
			</Popover.Content>
		</Popover>
	);
};
