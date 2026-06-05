import { ChevronDownIcon, Settings2Icon, XIcon } from "lucide-react";
import type * as React from "react";
import {
	Button,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
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

interface ListFiltersButtonProps
	extends React.ComponentPropsWithoutRef<typeof Button> {}

interface ListFiltersPanelProps extends React.ComponentPropsWithoutRef<"div"> {}

interface ListFiltersDrawerProps {
	ariaLabel?: string;
	children: React.ReactNode;
	className?: string;
	footer?: React.ReactNode;
	iconOnly?: boolean;
	label?: string;
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
		<div
			className={cn("flex w-full flex-col gap-3 [&>*:empty]:hidden", className)}
			{...props}
		/>
	);
}

function ListFiltersBar({ className, ...props }: ListFiltersBarProps) {
	return (
		<div
			className={cn(
				"flex flex-row items-center justify-start w-full gap-3",
				className,
			)}
			{...props}
		/>
	);
}

function ListFiltersActions({ className, ...props }: ListFiltersActionsProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-2 md:flex-nowrap",
				className,
			)}
			{...props}
		/>
	);
}

function ListFiltersButton({
	className,
	size = "default",
	variant = "outline",
	...props
}: ListFiltersButtonProps) {
	return (
		<Button
			size={size}
			variant={variant}
			className={cn(className)}
			{...props}
		/>
	);
}

function ListFiltersPanel({ className, ...props }: ListFiltersPanelProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-start gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 *:min-w-0 *:w-full md:*:w-60",
				className,
			)}
			{...props}
		/>
	);
}

function ListFiltersDrawer({
	ariaLabel,
	children,
	className,
	footer,
	iconOnly = false,
	label = "Filtros",
	title,
}: ListFiltersDrawerProps) {
	return (
		<Drawer>
			<DrawerTrigger
				render={
					<Button
						variant="outline"
						size={iconOnly ? "default" : "sm"}
						aria-label={ariaLabel ?? label}
						className={cn(iconOnly && "shrink-0")}
					/>
				}
			>
				<Settings2Icon size={16} />
				{iconOnly ? <span className="sr-only">{label}</span> : label}
			</DrawerTrigger>
			<DrawerContent
				direction="bottom"
				className={cn("max-h-[85vh]", className)}
			>
				<DrawerHeader>
					<DrawerTitle>{title ?? label}</DrawerTitle>
				</DrawerHeader>
				<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
					{children}
				</div>
				<DrawerFooter>
					{footer}
					<DrawerClose render={<Button variant="outline" className="w-full" />}>
						Fechar
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
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
			<PopoverTrigger render={<ListFiltersButton />}>
				{label}
				<ChevronDownIcon size={16} />
			</PopoverTrigger>
			<PopoverContent align="start" className={cn("p-4", className)}>
				{title ? (
					<PopoverHeader>
						<PopoverTitle>{title}</PopoverTitle>
					</PopoverHeader>
				) : null}
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
		<div
			className={cn("flex flex-wrap items-center gap-2", className)}
			{...props}
		>
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
	Button: ListFiltersButton,
	Drawer: ListFiltersDrawer,
	Panel: ListFiltersPanel,
	Popover: ListFiltersPopover,
	Active: ListFiltersActive,
	Chip: ListFiltersChip,
	Clear: ListFiltersClear,
});
