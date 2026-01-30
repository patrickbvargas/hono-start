import { Link } from "@tanstack/react-router";
import {
	ChevronFirstIcon,
	ChevronLastIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	MoreHorizontalIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { type Button, buttonVariants } from "./button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
	return (
		<nav
			aria-label="pagination"
			data-slot="pagination"
			className={cn("mx-auto flex w-full justify-center", className)}
			{...props}
		/>
	);
}

function PaginationContent({
	className,
	...props
}: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot="pagination-content"
			className={cn("flex flex-row items-center gap-1", className)}
			{...props}
		/>
	);
}

interface PaginationItemProps extends React.ComponentProps<"li"> {
	isDisabled?: boolean;
}
function PaginationItem({
	isDisabled,
	className,
	...props
}: PaginationItemProps) {
	return (
		<li
			data-slot="pagination-item"
			className={cn(isDisabled && "pointer-events-none opacity-50", className)}
			{...props}
		/>
	);
}

type PaginationLinkProps = {
	isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
	React.ComponentProps<typeof Link>;
function PaginationLink({
	className,
	isActive,
	size = "icon",
	...props
}: PaginationLinkProps) {
	return (
		<Link
			aria-current={isActive ? "page" : undefined}
			data-slot="pagination-link"
			data-active={isActive}
			preload="intent"
			className={cn(
				buttonVariants({
					variant: isActive ? "outline" : "ghost",
					size,
				}),
				className,
			)}
			{...props}
		/>
	);
}

function PaginationPrevious({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Ir para a página anterior"
			size="default"
			className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
			{...props}
		>
			<ChevronLeftIcon />
			<span className="sr-only">Anterior</span>
		</PaginationLink>
	);
}

function PaginationNext({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Ir para a próxima página"
			size="default"
			className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
			{...props}
		>
			<span className="sr-only">Próximo</span>
			<ChevronRightIcon />
		</PaginationLink>
	);
}

function PaginationFirst({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Ir para a primeira página"
			size="default"
			className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
			{...props}
		>
			<ChevronFirstIcon />
			<span className="sr-only">Primeira</span>
		</PaginationLink>
	);
}

function PaginationLast({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Ir para a última página"
			size="default"
			className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
			{...props}
		>
			<ChevronLastIcon />
			<span className="sr-only">Última</span>
		</PaginationLink>
	);
}

function PaginationEllipsis({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			aria-hidden
			data-slot="pagination-ellipsis"
			className={cn("flex size-9 items-center justify-center", className)}
			{...props}
		>
			<MoreHorizontalIcon className="size-4" />
			<span className="sr-only">More pages</span>
		</span>
	);
}

function PaginationFeedback({
	className,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p
			className={cn("truncate text-sm text-foreground", className)}
			{...props}
		/>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationLink,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
	PaginationEllipsis,
	PaginationFeedback,
	PaginationFirst,
	PaginationLast,
};
