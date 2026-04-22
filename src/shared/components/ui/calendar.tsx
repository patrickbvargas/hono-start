import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
	Calendar as AriaCalendar,
	Button,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	Heading,
} from "react-aria-components";
import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

function Calendar({
	className,
	firstDayOfWeek = "sun",
	...props
}: React.ComponentProps<typeof AriaCalendar>) {
	return (
		<AriaCalendar
			firstDayOfWeek={firstDayOfWeek}
			className={cn("w-54 p-2 space-y-2", className)}
			{...props}
		>
			<header className="w-full flex items-center justify-between gap-1">
				<Button
					slot="previous"
					className={buttonVariants({
						size: "icon-sm",
						variant: "ghost",
					})}
				>
					<ChevronLeftIcon aria-hidden size={18} />
				</Button>
				<Heading className="text-primary" />
				<Button
					slot="next"
					className={buttonVariants({
						size: "icon-sm",
						variant: "ghost",
					})}
				>
					<ChevronRightIcon aria-hidden size={18} />
				</Button>
			</header>
			<CalendarGrid className="w-full border-collapse">
				<CalendarGridHeader>
					{(day) => (
						<CalendarHeaderCell className="text-muted-foreground font-light">
							{day}
						</CalendarHeaderCell>
					)}
				</CalendarGridHeader>
				<CalendarGridBody>
					{(date) => (
						<CalendarCell
							date={date}
							className={cn(
								buttonVariants({
									size: "icon-sm",
									variant: "ghost",
								}),
								"data-today:bg-muted data-today:text-foreground",
								"data-selected:bg-primary data-selected:text-primary-foreground",
								"data-outside-month:text-muted-foreground data-outside-month:pointer-events-none",
							)}
						/>
					)}
				</CalendarGridBody>
			</CalendarGrid>
		</AriaCalendar>
	);
}

export { Calendar };
