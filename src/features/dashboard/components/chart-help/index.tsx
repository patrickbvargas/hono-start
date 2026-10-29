import { InfoIcon } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/components/ui";

interface ChartHelpProps {
	title: string;
	description: string;
}

export function ChartHelp({ title, description }: ChartHelpProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					className="max-md:hidden [@media(hover:none)]:hidden"
					render={
						<button
							type="button"
							aria-label={`Sobre ${title}`}
							className="inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
						/>
					}
				>
					<InfoIcon className="size-3.5" />
				</TooltipTrigger>
				<TooltipContent>{description.replaceAll(". ", ".\n")}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
