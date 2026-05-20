import { ChevronDownIcon, XIcon } from "lucide-react";
import type * as React from "react";
import {
	Button,
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface ListFiltersRootProps extends React.ComponentPropsWithoutRef<"div"> {}

interface ListFiltersBarProps extends React.ComponentPropsWithoutRef<"div"> {}

interface ListFiltersActionsProps
	extends React.ComponentPropsWithoutRef<"div"> {}

interface ListFiltersPopoverProps {
	children: React.ReactNode;
	className?: string;
	label: string;
	title?: string;
}

interface ListFiltersActiveProps extends React.ComponentPropsWithoutRef<"div"> {
	children: React.ReactNode;
}

interface ListFiltersChipProps {
	children: React.ReactNode;
	onRemove: () => void;
	removeLabel: string;
}

interface ListFiltersClearProps {
	children?: React.ReactNode;
	onClick: () => void;
}

function ListFiltersRoot({ className, ...props }: ListFiltersRootProps) {
	return (
		<div className={cn("flex w-full flex-col gap-3", className)} {...props} />
	);
}

function ListFiltersBar({ className, ...props }: ListFiltersBarProps) {
	return (
		<div
			className={cn(
				"flex w-full flex-col gap-3 md:flex-row md:items-center",
				className,
			)}
			{...props}
		/>
	);
}

function ListFiltersActions({ className, ...props }: ListFiltersActionsProps) {
	return (
		<div className={cn("flex items-center gap-2", className)} {...props} />
	);
}

function ListFiltersPopover({
	children,
	className,
	label,
	title,
}: ListFiltersPopoverProps) {
	return (
		<Popover>
			<PopoverTrigger render={<Button variant="outline" size="sm" />}>
				{label}
				<ChevronDownIcon size={16} />
			</PopoverTrigger>
			<PopoverContent align="start" className={cn("p-4", className)}>
				<PopoverHeader>
					<PopoverTitle>{title ?? label}</PopoverTitle>
				</PopoverHeader>
				{children}
			</PopoverContent>
		</Popover>
	);
}

function ListFiltersActive({
	children,
	className,
	...props
}: ListFiltersActiveProps) {
	return (
		<div className={cn("flex items-center gap-2", className)} {...props}>
			{children}
		</div>
	);
}

function ListFiltersChip({
	children,
	onRemove,
	removeLabel,
}: ListFiltersChipProps) {
	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			onClick={onRemove}
			className="rounded-full"
			aria-label={removeLabel}
		>
			{children}
			<XIcon />
		</Button>
	);
}

function ListFiltersClear({
	children = "Limpar tudo",
	onClick,
}: ListFiltersClearProps) {
	return (
		<Button type="button" variant="ghost" size="sm" onClick={onClick}>
			{children}
		</Button>
	);
}

export const ListFilters = Object.assign(ListFiltersRoot, {
	Bar: ListFiltersBar,
	Actions: ListFiltersActions,
	Popover: ListFiltersPopover,
	Active: ListFiltersActive,
	Chip: ListFiltersChip,
	Clear: ListFiltersClear,
});
