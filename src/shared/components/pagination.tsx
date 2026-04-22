import { createLink } from "@tanstack/react-router";
import {
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationRoot,
} from "@/shared/components/ui";
import { usePagination } from "@/shared/hooks/use-pagination";
import { cn } from "@/shared/lib/utils";

const CustomLink = createLink(PaginationLink);
const CustomLinkNext = createLink(PaginationNext);
const CustomLinkPrevious = createLink(PaginationPrevious);

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
					<CustomLink
						to="."
						search={getPaginationSearch(pageNumber)}
						isActive={pageNumber === page}
					>
						{pageNumber}
					</CustomLink>
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
				<PaginationItem>
					<CustomLinkPrevious to="." search={getPaginationSearch(page - 1)} />
				</PaginationItem>
				{renderPageLinks()}
				<PaginationItem>
					<CustomLinkNext to="." search={getPaginationSearch(page + 1)} />
				</PaginationItem>
			</PaginationContent>
		</PaginationRoot>
	);
};
