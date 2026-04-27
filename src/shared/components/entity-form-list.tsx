import { useMemo, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface WrapperProps<T> {
	items: T[];
	getKey: (item: T, index: number) => string;
	getTitle: (item: T, index: number) => string;
	getSummary: (item: T, index: number) => string;
	getDescription: (item: T, index: number) => string;
	renderContent: (item: T, index: number) => React.ReactNode;
	openDescription?: string;
	className?: string;
	emptyState?: React.ReactNode;
}

function Wrapper<T>({
	items,
	getKey,
	getTitle,
	getSummary,
	getDescription,
	renderContent,
	openDescription = "Preencha os campos abaixo.",
	className,
	emptyState = null,
}: WrapperProps<T>) {
	const [openItems, setOpenItems] = useState<string[]>([]);

	const validOpenItems = useMemo(
		() =>
			openItems.filter((value) =>
				items.some((item, index) => getKey(item, index) === value),
			),
		[openItems, items, getKey],
	);

	if (items.length === 0) {
		return <>{emptyState}</>;
	}

	return (
		<Accordion
			multiple
			value={validOpenItems}
			onValueChange={(value) => setOpenItems(value.map(String))}
			className={cn("rounded-lg border", className)}
		>
			{items.map((item, index) => {
				const key = getKey(item, index);
				const isOpen = validOpenItems.includes(key);

				return (
					<AccordionItem key={key} value={key} className="px-4">
						<AccordionTrigger className="py-3 hover:no-underline">
							<Header
								isOpen={isOpen}
								title={getTitle(item, index)}
								summary={getSummary(item, index)}
								description={getDescription(item, index)}
								openDescription={openDescription}
							/>
						</AccordionTrigger>
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
	isOpen: boolean;
	title: string;
	summary: string;
	description: string;
	openDescription: string;
}

function Header({
	isOpen,
	title,
	summary,
	description,
	openDescription,
}: HeaderProps) {
	return (
		<div className="flex flex-col gap-1 pr-4 text-left">
			<span className="font-medium text-sm">{isOpen ? title : summary}</span>
			<span className="text-muted-foreground text-xs">
				{isOpen ? openDescription : description}
			</span>
		</div>
	);
}

export const EntityFormList = Object.assign(Wrapper, {
	Header,
});
