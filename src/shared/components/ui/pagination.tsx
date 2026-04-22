import { Link } from "@tanstack/react-router";
import {
	ChevronFirstIcon,
	ChevronLastIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	MoreHorizontalIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

function PaginationRoot({ className, ...props }: React.ComponentProps<"nav">) {
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
			className={cn("flex items-center gap-0.5", className)}
			{...props}
		/>
	);
}

type PaginationItemProps = {
	isDisabled?: boolean;
} & React.ComponentProps<"li">;

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
		<Button
			variant={isActive ? "outline" : "ghost"}
			size={size}
			className={cn(className)}
			nativeButton={false}
			render={
				<Link
					aria-current={isActive ? "page" : undefined}
					data-slot="pagination-link"
					data-active={isActive}
					{...props}
				/>
			}
		/>
	);
}

function PaginationPrevious({
	className,
	text = "Previous",
	...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
	return (
		<PaginationLink aria-label="Go to previous page" {...props}>
			<ChevronLeftIcon data-icon="inline-start" />
			<span className="sr-only">{text}</span>
		</PaginationLink>
	);
}

function PaginationNext({
	className,
	text = "Next",
	...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
	return (
		<PaginationLink aria-label="Go to next page" {...props}>
			<span className="sr-only">{text}</span>
			<ChevronRightIcon data-icon="inline-end" />
		</PaginationLink>
	);
}

function PaginationFirst({
	className,
	text = "First",
	...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
	return (
		<PaginationLink aria-label="Go to first page" {...props}>
			<span className="sr-only">{text}</span>
			<ChevronFirstIcon data-icon="inline-end" />
		</PaginationLink>
	);
}

function PaginationLast({
	className,
	text = "Last",
	...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
	return (
		<PaginationLink aria-label="Go to last page" {...props}>
			<span className="sr-only">{text}</span>
			<ChevronLastIcon data-icon="inline-end" />
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
			className={cn(
				"flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<MoreHorizontalIcon />
			<span className="sr-only">More pages</span>
		</span>
	);
}

export {
	PaginationRoot,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationFirst,
	PaginationLast,
};
