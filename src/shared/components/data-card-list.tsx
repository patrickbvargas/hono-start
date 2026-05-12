import type * as React from "react";
import {
	type DetailFieldItem,
	EntityFields,
} from "@/shared/components/entity-fields";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	ScrollArea,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface DataCardListProps<TData> {
	data: TData[];
	getRowKey: (item: TData, index: number) => React.Key;
	renderTitle: (item: TData) => React.ReactNode;
	renderDescription?: (item: TData) => React.ReactNode;
	renderFields: (item: TData) => DetailFieldItem[];
	renderActions?: (item: TData) => React.ReactNode;
	onCardAction?: (item: TData) => void;
	emptyMessage?: string;
	className?: string;
	footerContent?: React.ReactNode;
}

export const DataCardList = <TData,>({
	data,
	getRowKey,
	renderTitle,
	renderDescription,
	renderFields,
	renderActions,
	onCardAction,
	emptyMessage = "Nenhum registro encontrado.",
	className,
	footerContent,
}: DataCardListProps<TData>) => {
	return (
		<div
			className={cn(
				"flex min-h-0 max-h-full flex-col overflow-hidden rounded-lg",
				className,
			)}
		>
			<ScrollArea className="min-h-0 flex-1">
				{data.length ? (
					<div className="grid grid-cols-1 gap-3 pb-3 px-0.5 -mx-0.5 lg:grid-cols-3 2xl:grid-cols-4">
						{data.map((item, index) => {
							const title = renderTitle(item);
							const description = renderDescription?.(item);
							const actions = renderActions?.(item);
							const fields = renderFields(item);
							const isInteractive = !!onCardAction;

							return (
								<Card
									key={getRowKey(item, index)}
									size="sm"
									role={isInteractive ? "button" : undefined}
									tabIndex={isInteractive ? 0 : undefined}
									onClick={() => onCardAction?.(item)}
									onKeyDown={(event) => {
										if (!isInteractive) {
											return;
										}

										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											onCardAction?.(item);
										}
									}}
									className={cn(
										"border border-border/60 bg-card text-left",
										isInteractive &&
											"cursor-pointer transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									)}
								>
									<CardHeader className="flex items-center justify-between gap-3">
										<CardTitle>{title}</CardTitle>
										{description ? (
											<CardDescription>{description}</CardDescription>
										) : null}
										{actions ? (
											<CardAction
												onClick={(event) => {
													event.stopPropagation();
												}}
												onKeyDown={(event) => {
													event.stopPropagation();
												}}
											>
												{actions}
											</CardAction>
										) : null}
									</CardHeader>
									<CardContent>
										<EntityFields items={fields} columns={2} />
									</CardContent>
								</Card>
							);
						})}
					</div>
				) : (
					<div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
						{emptyMessage}
					</div>
				)}
			</ScrollArea>
			{footerContent ? (
				<div className="flex justify-end bg-background px-3 py-2">
					{footerContent}
				</div>
			) : null}
		</div>
	);
};
