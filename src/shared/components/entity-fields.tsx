import type * as React from "react";
import { Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface FieldClassNames {
	item?: string;
	term?: string;
	definition?: string;
}

export interface FieldsClassNames extends FieldClassNames {
	root?: string;
}

export interface DetailFieldItem {
	term: string;
	definition: string | number | React.ReactNode;
	classNames?: FieldClassNames;
}

interface FieldTermProps {
	item: DetailFieldItem;
	layout?: "stacked" | "inline";
	classNames?: FieldsClassNames;
}

function FieldTerm({ item, layout, classNames }: FieldTermProps) {
	return (
		<dt
			className={cn(
				"tracking-wide text-foreground/60",
				layout === "inline" && "min-w-fit after:content-[':']",
				classNames?.term,
				item.classNames?.term,
			)}
		>
			{item.term}
		</dt>
	);
}

interface FieldDefinitionProps {
	item: DetailFieldItem;
	classNames?: FieldsClassNames;
}

function FieldDefinition({ item, classNames }: FieldDefinitionProps) {
	return (
		<dd
			className={cn(
				"text-foreground",
				classNames?.definition,
				item.classNames?.definition,
			)}
		>
			{item.definition}
		</dd>
	);
}

interface EntityFieldsProps extends React.HTMLAttributes<HTMLDListElement> {
	items: DetailFieldItem[];
	layout?: "stacked" | "inline";
	classNames?: FieldsClassNames;
	columns?: 1 | 2;
}

export const EntityFields = ({
	items,
	layout = "stacked",
	classNames,
	columns = 1,
	className,
	...props
}: EntityFieldsProps) => (
	<dl
		className={cn(
			"text-xs",
			columns === 1
				? "flex flex-col gap-4"
				: "grid grid-cols-2 gap-x-6 gap-y-4",
			classNames?.root,
			className,
		)}
		{...props}
	>
		{items.map((item, index) => (
			<div
				key={`${item.term}-${index}`}
				className={cn(
					layout === "stacked"
						? "flex min-w-0 flex-col gap-1.5"
						: "flex items-baseline gap-1.5",
					classNames?.item,
					item.classNames?.item,
				)}
			>
				<FieldTerm item={item} layout={layout} classNames={classNames} />
				<FieldDefinition item={item} classNames={classNames} />
			</div>
		))}
	</dl>
);

interface EntitySkeletonFieldsProps
	extends React.HTMLAttributes<HTMLDivElement> {
	rows?: number;
}

export function EntitySkeletonFields({
	rows = 3,
	className,
	...props
}: EntitySkeletonFieldsProps) {
	const skeletonRows = Array.from({ length: rows }, (_, rowIndex) => ({
		key: `row-${rows}-${rowIndex}-${rowIndex === rows - 1 ? "short" : "full"}`,
		isShort: rowIndex === rows - 1,
	}));

	return (
		<div className={cn("flex flex-col gap-4", className)} {...props}>
			{skeletonRows.map((row) => (
				<div key={row.key} className="flex flex-col gap-1.5">
					<Skeleton className="h-4 w-20" />
					<Skeleton
						className={cn("h-4", row.isShort ? "w-24" : "w-full max-w-56")}
					/>
				</div>
			))}
		</div>
	);
}
