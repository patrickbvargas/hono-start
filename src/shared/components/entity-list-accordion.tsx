import type * as React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface EntityListAccordionProps<T> {
	items: T[];
	getKey: (item: T, index: number) => string;
	getTitle: (item: T, index: number) => string;
	getSummary: (item: T, index: number) => string;
	getDescription?: (item: T, index: number) => string;
	renderContent: (item: T, index: number) => React.ReactNode;
	actions?: (item: T, index: number) => React.ReactNode;
	openDescription?: string;
	className?: string;
	emptyState?: React.ReactNode;
}

export function EntityListAccordion<T>({
	items,
	getKey,
	getTitle,
	getSummary,
	getDescription,
	renderContent,
	actions,
	openDescription,
	className,
	emptyState = null,
}: EntityListAccordionProps<T>) {
	if (items.length === 0) {
		return <>{emptyState}</>;
	}

	return (
		<Accordion multiple className={cn("rounded-lg border", className)}>
			{items.map((item, index) => {
				const key = getKey(item, index);
				const title = getTitle(item, index);
				const summary = getSummary(item, index);
				const description = getDescription?.(item, index);
				const itemActions = actions?.(item, index);

				return (
					<AccordionItem key={key} value={key} className="px-4">
						<div className="relative">
							<AccordionTrigger
								className={cn(
									"py-3 hover:no-underline",
									"**:data-[slot=accordion-trigger-icon]:absolute **:data-[slot=accordion-trigger-icon]:right-0 **:data-[slot=accordion-trigger-icon]:top-1/2 **:data-[slot=accordion-trigger-icon]:-translate-y-1/2",
									itemActions ? "pr-32" : "pr-7",
								)}
								aria-label={summary}
							>
								<EntityListAccordionHeader
									title={title}
									summary={summary}
									description={description}
									openDescription={openDescription}
								/>
							</AccordionTrigger>
							{itemActions ? (
								<div
									onClick={(event) => {
										event.stopPropagation();
									}}
									onKeyDown={(event) => {
										event.stopPropagation();
									}}
									className="absolute top-1/2 right-7 flex -translate-y-1/2 items-center gap-2"
								>
									{itemActions}
								</div>
							) : null}
						</div>
						<AccordionContent className="pb-4">
							{renderContent(item, index)}
						</AccordionContent>
					</AccordionItem>
				);
			})}
		</Accordion>
	);
}

interface HeaderProps {
	title: string;
	summary: string;
	description?: string;
	openDescription?: string;
}

export function EntityListAccordionHeader({
	title,
	summary,
	description,
	openDescription,
}: HeaderProps) {
	return (
		<div className="min-w-0 flex-1 pr-4 text-left">
			<span className="truncate font-medium text-sm group-aria-expanded/accordion-trigger:hidden">
				{summary}
			</span>
			<span className="hidden truncate font-medium text-sm group-aria-expanded/accordion-trigger:block">
				{title}
			</span>
			{description ? (
				<span className="text-muted-foreground text-xs group-aria-expanded/accordion-trigger:hidden">
					{description}
				</span>
			) : null}
			{openDescription ? (
				<span className="hidden text-muted-foreground text-xs group-aria-expanded/accordion-trigger:block">
					{openDescription}
				</span>
			) : null}
		</div>
	);
}
