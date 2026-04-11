import type * as React from "react";
import {
	Button,
	Drawer,
	type DrawerProps,
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

interface WrapperProps extends Omit<DrawerProps, "state"> {
	title: string;
	state: OverlayState;
}

export const Wrapper = ({ title, state, children, ...props }: WrapperProps) => {
	return (
		<Drawer {...props}>
			<Drawer.Backdrop isOpen={state.isOpen} onOpenChange={state.onOpenChange}>
				<Drawer.Content placement="right">
					<Drawer.Dialog>
						<Drawer.CloseTrigger />
						<Drawer.Header>
							<Drawer.Heading>{title}</Drawer.Heading>
						</Drawer.Header>
						<Drawer.Body className="flex flex-col gap-4">
							{children}
						</Drawer.Body>
						<Drawer.Footer>
							<Button slot="close" variant="outline" className="w-full">
								Fechar
							</Button>
						</Drawer.Footer>
					</Drawer.Dialog>
				</Drawer.Content>
			</Drawer.Backdrop>
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

export const Detail = Object.assign(Wrapper, {
	Section,
	Fields,
	Separator,
});
