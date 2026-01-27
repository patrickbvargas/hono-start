import { cn } from "@/shared/lib/utils";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationFirst,
	PaginationItem,
	PaginationLast,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "./ui/pagination";

const DEFAULT_SIBLING_COUNT = 1;
const MIN_PAGES_FOR_ELLIPSIS = 5; // Formula: 1 + (siblingCount * 2) + 2 = visible pages + buffer

interface PaginationProps extends React.ComponentProps<typeof Pagination> {
	totalPages: number;
	currentPage: number;
	onPageChange: (page: number) => void;
	siblingCount?: number;
	showFirstAndLastPage?: boolean;
	showNextPrevious?: boolean;
	maxDisplayedPages?: number;
}
export const PaginationControl = ({
	totalPages = 0,
	currentPage = 1,
	onPageChange,
	siblingCount = DEFAULT_SIBLING_COUNT,
	showFirstAndLastPage = true,
	showNextPrevious = true,
	maxDisplayedPages,
	className,
	...props
}: PaginationProps) => {
	const validatedSiblingCount = maxDisplayedPages
		? Math.max(0, Math.min(siblingCount, Math.floor(maxDisplayedPages / 2) - 1))
		: siblingCount;

	const totalDisplayPages = 1 + validatedSiblingCount * 2;
	const startPage = Math.max(
		1,
		Math.min(
			currentPage - validatedSiblingCount,
			totalPages - totalDisplayPages + 1,
		),
	);
	const endPage = Math.min(totalPages, startPage + totalDisplayPages - 1);

	const renderPageLinks = () => {
		return Array.from({ length: endPage - startPage + 1 }, (_, index) => {
			const pageNumber = startPage + index;
			return (
				<PaginationItem key={pageNumber}>
					<PaginationLink
						href="#"
						onClick={() => onPageChange(pageNumber)}
						isActive={pageNumber === currentPage}
						aria-label={`Ir para a página ${pageNumber}`}
					>
						{pageNumber}
					</PaginationLink>
				</PaginationItem>
			);
		});
	};

	const isFirstPreviousDisabled = currentPage <= 1;
	const isLastNextDisabled = currentPage >= totalPages;
	const showLeftEllipsis =
		startPage > 1 && totalPages >= MIN_PAGES_FOR_ELLIPSIS;
	const showRightEllipsis =
		endPage < totalPages && totalPages >= MIN_PAGES_FOR_ELLIPSIS;

	return (
		<Pagination className={cn("flex gap-3 justify-end", className)} {...props}>
			<PaginationContent>
				{showFirstAndLastPage && (
					<PaginationItem isDisabled={isFirstPreviousDisabled}>
						<PaginationFirst href="#" onClick={() => onPageChange(1)} />
					</PaginationItem>
				)}

				{showNextPrevious && (
					<PaginationItem isDisabled={isFirstPreviousDisabled}>
						<PaginationPrevious
							href="#"
							onClick={() => onPageChange(currentPage - 1)}
						/>
					</PaginationItem>
				)}

				{showLeftEllipsis && (
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				)}

				{renderPageLinks()}

				{showRightEllipsis && (
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				)}

				{showNextPrevious && (
					<PaginationItem isDisabled={isLastNextDisabled}>
						<PaginationNext
							href="#"
							onClick={() => onPageChange(currentPage + 1)}
						/>
					</PaginationItem>
				)}

				{showFirstAndLastPage && (
					<PaginationItem isDisabled={isLastNextDisabled}>
						<PaginationLast href="#" onClick={() => onPageChange(totalPages)} />
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	);
};
