import {
	ArrowLeftIcon,
	FilePlus2Icon,
	InboxIcon,
	SearchXIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

interface ListEmptyStateProps {
	title: string;
	description: string;
	hasFilters: boolean;
	onClearFilters: () => void;
	createAction?: ReactNode;
	hasRecords?: boolean;
	onFirstPage?: () => void;
}

export function ListEmptyState({
	title,
	description,
	hasFilters,
	onClearFilters,
	createAction,
	hasRecords = false,
	onFirstPage,
}: ListEmptyStateProps) {
	const Icon = hasRecords
		? ArrowLeftIcon
		: hasFilters
			? SearchXIcon
			: createAction
				? FilePlus2Icon
				: InboxIcon;
	return (
		<div
			data-slot="list-empty-state"
			className="flex min-h-64 w-full flex-col items-center justify-center gap-5 px-6 py-10 text-center"
		>
			<div className="flex size-12 items-center justify-center rounded-xl border bg-muted/40 text-muted-foreground">
				<Icon className="size-6" aria-hidden="true" />
			</div>
			<div className="max-w-sm space-y-2">
				<h3 className="text-base font-medium text-foreground">
					{hasRecords
						? "Nenhum registro nesta página"
						: hasFilters
							? "Nenhum resultado encontrado"
							: title}
				</h3>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{hasRecords
						? "Volte à primeira página para continuar consultando os registros."
						: hasFilters
							? "Nenhum registro corresponde à busca ou aos filtros aplicados. Tente ajustar ou limpar os filtros."
							: description}
				</p>
			</div>
			{hasRecords ? (
				<Button type="button" size="sm" variant="outline" onClick={onFirstPage}>
					Ir para a primeira página
				</Button>
			) : hasFilters ? (
				<Button
					type="button"
					size="sm"
					variant="outline"
					onClick={onClearFilters}
				>
					Limpar filtros
				</Button>
			) : (
				createAction
			)}
		</div>
	);
}
