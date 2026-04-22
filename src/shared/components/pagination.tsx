import { cn } from "@/shared/lib/utils";
import { usePagination } from "../hooks/use-pagination";
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

interface PaginationProps extends React.ComponentProps<typeof PaginationRoot> {
	totalRecords: number;
	siblingCount?: number;
}

export const Pagination = ({
	totalRecords = 0,
	siblingCount = DEFAULT_SIBLING_COUNT,
	className,
	...props
}: PaginationProps) => {
	const { page, limit, getPaginationSearch } = usePagination();

	if (totalRecords === 0) return null;

	const totalPagesCount = Math.ceil(totalRecords / limit);
	const totalDisplayPages = 1 + siblingCount * 2;

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
				"flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		>
			<PaginationContent>
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
