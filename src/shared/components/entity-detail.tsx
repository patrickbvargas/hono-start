import type * as React from "react";
import {
	Button,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	Separator,
	Skeleton,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { OverlayState } from "@/shared/types/overlay";

interface FieldClassNames {
	item?: string;
	term?: string;
	definition?: string;
}

interface SectionClassNames {
	root?: string;
	title?: string;
	content?: string;
}

interface FieldsClassNames extends FieldClassNames {
	root?: string;
}

export interface DetailFieldItem {
	term: string;
	definition: string | number | React.ReactNode;
	classNames?: FieldClassNames;
}

interface RootProps {
	state: OverlayState;
	children: React.ReactNode;
}

function Root({ state, children, ...props }: RootProps) {
	const container =
		typeof document === "undefined"
			? null
			: document.querySelector<HTMLElement>('[data-slot="root-container"]');

	return (
		<Drawer
			container={container}
			direction="right"
			open={state.isOpen}
			onOpenChange={state.onOpenChange}
			{...props}
		>
			<DrawerContent>{children}</DrawerContent>
		</Drawer>
	);
}

interface ContentProps {
	children: React.ReactNode;
}

function Content({ children }: ContentProps) {
	return <>{children}</>;
}

function Header({ children, ...props }: React.ComponentProps<"div">) {
	return <DrawerHeader {...props}>{children}</DrawerHeader>;
}

interface TitleProps {
	children: React.ReactNode;
}

function Title({
	children,
	...props
}: TitleProps & React.ComponentProps<typeof DrawerTitle>) {
	return <DrawerTitle {...props}>{children}</DrawerTitle>;
}

function Body({ children, className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("flex flex-col gap-4 overflow-y-auto px-4", className)}
			{...props}
		>
			{children}
		</div>
	);
}

function Footer({ children, ...props }: React.ComponentProps<"div">) {
	return (
		<DrawerFooter {...props}>
			{children ?? (
				<DrawerClose asChild>
					<Button variant="outline" className="w-full">
						Fechar
					</Button>
				</DrawerClose>
			)}
		</DrawerFooter>
	);
}

function SkeletonTitle({ className }: React.ComponentProps<"div">) {
	return <Skeleton className={cn("h-6 w-40", className)} />;
}

interface SectionProps {
	title: string;
	children: React.ReactNode;
	classNames?: SectionClassNames;
	className?: string;
}

const Section = ({ title, children, classNames, className }: SectionProps) => {
	return (
		<section className={cn("flex flex-col gap-2", classNames?.root, className)}>
			<h3
				className={cn(
					"text-sm font-semibold uppercase tracking-wider text-foreground",
					classNames?.title,
				)}
			>
				{title}
			</h3>
			<div className={cn(classNames?.content)}>{children}</div>
		</section>
	);
};

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

interface FieldsProps extends React.HTMLAttributes<HTMLDListElement> {
	items: DetailFieldItem[];
	layout?: "stacked" | "inline";
	classNames?: FieldsClassNames;
}

const Fields = ({
	items,
	layout = "stacked",
	classNames,
	className,
	...props
}: FieldsProps) => (
	<dl
		className={cn("text-xs flex flex-col gap-4", classNames?.root, className)}
		{...props}
	>
		{items.map((item, index) => (
			<div
				key={`${item.term}-${index}`}
				className={cn(
					layout === "stacked"
						? "flex flex-col gap-1.5"
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

interface SkeletonFieldsProps extends React.HTMLAttributes<HTMLDivElement> {
	rows?: number;
}

function SkeletonFields({
	rows = 3,
	className,
	...props
}: SkeletonFieldsProps) {
	const skeletonRows = Array.from({ length: rows }, (_, rowIndex) => ({
		key: `row-${rows}-${rowIndex}-${rowIndex === rows - 1 ? "short" : "full"}`,
		isShort: rowIndex === rows - 1,
	}));

	return (
		<div className={cn("flex flex-col gap-4", className)} {...props}>
			{skeletonRows.map((row) => (
				<div key={row.key} className="flex flex-col gap-1.5">
					<Skeleton className="h-3 w-20" />
					<Skeleton
						className={cn("h-4", row.isShort ? "w-24" : "w-full max-w-56")}
					/>
				</div>
			))}
		</div>
	);
}

export const EntityDetail = {
	Root,
	Content,
	Header,
	Title,
	Body,
	Footer,
	Section,
	Fields,
	SkeletonFields,
	SkeletonTitle,
	Separator,
};
