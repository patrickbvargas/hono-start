import { createLink } from "@tanstack/react-router";
import {
	Pagination as HPagination,
	type PaginationProps as HPaginationProps,
} from "@/shared/components/ui";
import { usePagination } from "@/shared/hooks/use-pagination";
import { cn } from "@/shared/lib/utils";

const CustomLink = createLink(HPagination.Link);
const CustomLinkNext = createLink(HPagination.Next);
const CustomLinkPrevious = createLink(HPagination.Previous);

const DEFAULT_SIBLING_COUNT = 1;

interface PaginationProps extends Omit<HPaginationProps, "children"> {
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
				<HPagination.Item key={pageNumber}>
					<CustomLink
						to="."
						search={getPaginationSearch(pageNumber)}
						isActive={pageNumber === page}
					>
						{pageNumber}
					</CustomLink>
				</HPagination.Item>
			);
		});

	const generateFeedback = () => {
		const initialItem = (page - 1) * limit + 1;
		const finalItem = Math.min(initialItem + limit - 1, totalRecords);
		const entityName = totalRecords === 1 ? "registro" : "registros";
		return `${initialItem}-${finalItem} de ${totalRecords} ${entityName}`;
	};

	return (
		<HPagination
			className={cn(
				"flex flex-col-reverse gap-3 sm:flex-row sm:justify-between",
				className,
			)}
			{...props}
		>
			<HPagination.Summary>{generateFeedback()}</HPagination.Summary>
			<HPagination.Content>
				<HPagination.Item>
					<CustomLinkPrevious
						to="."
						search={getPaginationSearch(page - 1)}
						isDisabled={page === 1}
					>
						<HPagination.PreviousIcon />
						<span>Anterior</span>
					</CustomLinkPrevious>
				</HPagination.Item>
				{renderPageLinks()}
				<HPagination.Item>
					<CustomLinkNext
						to="."
						search={getPaginationSearch(page + 1)}
						isDisabled={!(page < totalPagesCount)}
					>
						<span>Próximo</span>
						<HPagination.NextIcon />
					</CustomLinkNext>
				</HPagination.Item>
			</HPagination.Content>
		</HPagination>
	);
};
