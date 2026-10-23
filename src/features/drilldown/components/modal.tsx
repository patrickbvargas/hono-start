import type { QueryKey } from "@tanstack/react-query";
import type { RowData } from "@tanstack/react-table";
import { InfoIcon } from "lucide-react";
import { DataTable } from "@/shared/components/data-table";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Skeleton,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { useDrilldownController } from "../hooks/use-controller";
import { useDrilldownData } from "../hooks/use-data";
import type { DrilldownProps, DrilldownResult } from "../schemas/model";

export function Drilldown<
	T extends RowData,
	TContext,
	TFilters,
	TResult extends DrilldownResult<T>,
	TKey extends QueryKey,
>(props: DrilldownProps<T, TContext, TFilters, TResult, TKey>) {
	const key = JSON.stringify([props.context, props.filters]);
	const { handleOpenChange, restoreFocus } = useDrilldownController(props);
	return (
		<Dialog open={props.state.isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				className={cn(
					"flex max-h-[85dvh] flex-col sm:max-w-5xl",
					props.className,
				)}
				finalFocus={
					props.returnFocus
						? () => {
								restoreFocus();
								return false;
							}
						: undefined
				}
			>
				<DialogHeader>
					<div className="flex items-center gap-2 pr-6">
						<DialogTitle>{props.title}</DialogTitle>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger
									render={
										<button
											type="button"
											aria-label={`Contexto de ${props.title}`}
											className="inline-flex shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										/>
									}
								>
									<InfoIcon className="size-3.5" />
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									{props.description}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<DialogDescription className="sr-only">
						{props.description}
					</DialogDescription>
				</DialogHeader>
				{props.state.isOpen ? <DrilldownContent key={key} {...props} /> : null}
			</DialogContent>
		</Dialog>
	);
}

function DrilldownContent<
	T extends RowData,
	TContext,
	TFilters,
	TResult extends DrilldownResult<T>,
	TKey extends QueryKey,
>(props: DrilldownProps<T, TContext, TFilters, TResult, TKey>) {
	const { query } = useDrilldownData(props);
	if (query.isError) {
		return (
			<div role="alert" className="space-y-3">
				<p>
					{props.errorMessage ??
						"Não foi possível carregar os dados. Verifique seu acesso e tente novamente."}
				</p>
				<Button variant="outline" onClick={() => query.refetch()}>
					Tentar novamente
				</Button>
			</div>
		);
	}
	if (!query.data || query.isFetching) {
		return (
			<div role="status" aria-label="Carregando detalhes" className="space-y-2">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-40 w-full" />
			</div>
		);
	}
	const data = query.data;
	return (
		<>
			{props.renderSummary?.(data)}
			<DataTable
				columns={props.columns.map((column) => ({
					...column,
					enableSorting: false,
				}))}
				data={data.data}
				pageSize={props.pageSize ?? 10}
				emptyMessage={props.emptyMessage}
				getRowId={props.getRowId}
				className="min-h-0 flex-1"
			/>
		</>
	);
}
