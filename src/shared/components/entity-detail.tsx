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

interface WrapperProps {
	title: string;
	state: OverlayState;
	children: React.ReactNode;
}

export const EntityDetailDrawer = ({
	title,
	state,
	children,
	...props
}: WrapperProps) => {
	return (
		<Drawer
			direction="right"
			open={state.isOpen}
			onOpenChange={state.onOpenChange}
			{...props}
		>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>{title}</DrawerTitle>
				</DrawerHeader>
				<div className="flex flex-col gap-4 overflow-y-auto px-4">
					{children}
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button variant="outline" className="w-full">
							Fechar
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

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

export const EntityDetail = Object.assign(EntityDetailDrawer, {
	Section,
	Fields,
	Separator,
});
