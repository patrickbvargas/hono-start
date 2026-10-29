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
	ScrollArea,
	Skeleton,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { useDrilldownController } from "../../hooks/use-controller";
import { useDrilldownData } from "../../hooks/use-data";
import { useDrilldownTab } from "../../hooks/use-tab";
import type { DrilldownProps, DrilldownResult } from "../../schemas/model";
import { DrilldownSkeleton } from "./skeleton";

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
		<Dialog
			open={props.state.isOpen}
			modal={!props.detailOpen}
			onOpenChange={(open, details) => {
				if (props.detailOpen) {
					details.cancel();
					return;
				}
				handleOpenChange(open);
			}}
		>
			<DialogContent
				portalClassName={props.detailOpen ? "z-40" : undefined}
				className={cn(
					"flex h-dvh max-h-dvh max-w-full rounded-none flex-col overflow-hidden sm:h-[80dvh] sm:max-h-[80dvh] sm:rounded-xl sm:max-w-5xl",
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
									className="max-md:hidden [@media(hover:none)]:hidden"
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
								<TooltipContent>
									{props.description.replaceAll(". ", ".\n")}
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
			{props.children}
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
	const { tab, handleTabChange } = useDrilldownTab();
	if (query.isError) {
		return (
			<div role="alert" className="space-y-3">
				<p>
					{props.errorMessage ??
						"Não foi possível carregar os dados. Verifique seu acesso e tente novamente."}
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => query.refetch()}
				>
					Tentar novamente
				</Button>
			</div>
		);
	}
	const data = query.data;
	const loading = !data || query.isFetching;
	const summary = props.renderSummary ? (
		loading || !data ? (
			<Skeleton className="h-5 w-40 shrink-0" />
		) : (
			props.renderSummary(data)
		)
	) : null;
	const table =
		loading || !data ? (
			<DrilldownSkeleton />
		) : (
			<DataTable
				columns={props.columns}
				initialSorting={props.initialSorting}
				data={data.data}
				pageSize={props.pageSize ?? 25}
				emptyMessage={props.emptyMessage}
				getRowId={props.getRowId}
				rowActionLabel={props.rowActionLabel}
				renderRowContextMenu={
					props.renderRowContextMenu
						? (index) => props.renderRowContextMenu?.(data.data[index])
						: undefined
				}
				onRowAction={
					props.onRowAction
						? (index) => props.onRowAction?.(data.data[index])
						: undefined
				}
				className="min-h-0 flex-1"
			/>
		);
	if (!props.renderOverview) {
		return (
			<>
				{summary}
				{table}
			</>
		);
	}
	return (
		<Tabs
			value={tab}
			onValueChange={handleTabChange}
			className="min-h-0 flex-1"
		>
			<TabsList variant="line" aria-label="Visualização dos detalhes">
				<TabsTrigger value="summary">Resumo</TabsTrigger>
				<TabsTrigger value="data">Dados</TabsTrigger>
			</TabsList>
			{summary}
			<TabsContent
				value="summary"
				className="flex min-h-0 flex-1 overflow-hidden flex-col"
			>
				<ScrollArea className="min-h-0 flex-1">
					{loading || !data ? (
						<DrilldownSkeleton overview blocks={props.overviewSkeletonBlocks} />
					) : (
						props.renderOverview(data)
					)}
				</ScrollArea>
			</TabsContent>
			<TabsContent
				value="data"
				keepMounted
				className="flex min-h-0 flex-1 overflow-hidden flex-col [&[hidden]]:hidden"
			>
				{table}
			</TabsContent>
		</Tabs>
	);
}
