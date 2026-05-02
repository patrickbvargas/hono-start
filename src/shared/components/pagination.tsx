import { cn } from "@/shared/lib/utils";
import { usePagination } from "../hooks/use-pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui";
import {
	PaginationContent,
	PaginationFirst,
	PaginationItem,
	PaginationLast,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationRoot,
} from "./ui/pagination";

const DEFAULT_SIBLING_COUNT = 1;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

interface PaginationProps extends React.ComponentProps<typeof PaginationRoot> {
	totalRecords: number;
	siblingCount?: number;
	pageSizeOptions?: readonly number[];
}

export const Pagination = ({
	totalRecords = 0,
	siblingCount = DEFAULT_SIBLING_COUNT,
	pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
	className,
	...props
}: PaginationProps) => {
	const { page, limit, getPaginationSearch, handlePageSizeChange } =
		usePagination();

	if (totalRecords === 0) return null;

	const totalPagesCount = Math.ceil(totalRecords / limit);
	const totalDisplayPages = 1 + siblingCount * 2;
	const displayedStartRecord = (page - 1) * limit + 1;
	const displayedEndRecord = Math.min(page * limit, totalRecords);
	const pageSizeValue = String(limit);
	const normalizedPageSizeOptions = Array.from(
		new Set([...pageSizeOptions, limit]),
	).sort((a, b) => a - b);

	const startPage = Math.max(
		1,
		Math.min(page - siblingCount, totalPagesCount - totalDisplayPages + 1),
	);
	const endPage = Math.min(totalPagesCount, startPage + totalDisplayPages - 1);

	const renderPageLinks = () =>
		Array.from({ length: endPage - startPage + 1 }, (_, index) => {
			const pageNumber = startPage + index;
			return (
				<PaginationItem key={pageNumber}>
					<PaginationLink
						search={getPaginationSearch(pageNumber)}
						isActive={pageNumber === page}
					>
						{pageNumber}
					</PaginationLink>
				</PaginationItem>
			);
		});

	return (
		<PaginationRoot
			className={cn(
				"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end",
				className,
			)}
			{...props}
		>
			<div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm text-muted-foreground">
					Exibindo {displayedStartRecord}-{displayedEndRecord} de {totalRecords}{" "}
					registros
				</p>
				<div className="flex items-center justify-end gap-2">
					<span className="text-sm text-muted-foreground">Por página</span>
					<Select
						value={pageSizeValue}
						onValueChange={(value) => {
							handlePageSizeChange(Number(value));
						}}
					>
						<SelectTrigger size="sm" className="min-w-20">
							<SelectValue />
						</SelectTrigger>
						<SelectContent align="end">
							{normalizedPageSizeOptions.map((pageSizeOption) => (
								<SelectItem key={pageSizeOption} value={String(pageSizeOption)}>
									{pageSizeOption}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<PaginationContent className="justify-end">
				<PaginationItem isDisabled={page === 1}>
					<PaginationFirst search={getPaginationSearch(1)} />
				</PaginationItem>
				<PaginationItem isDisabled={page === 1}>
					<PaginationPrevious search={getPaginationSearch(page - 1)} />
				</PaginationItem>
				{renderPageLinks()}
				<PaginationItem isDisabled={!(page < totalPagesCount)}>
					<PaginationNext search={getPaginationSearch(page + 1)} />
				</PaginationItem>
				<PaginationItem isDisabled={!(page < totalPagesCount)}>
					<PaginationLast search={getPaginationSearch(totalPagesCount)} />
				</PaginationItem>
			</PaginationContent>
		</PaginationRoot>
	);
};
