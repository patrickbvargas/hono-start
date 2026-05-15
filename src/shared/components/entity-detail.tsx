import type * as React from "react";
import {
	type DetailFieldItem,
	EntityFields,
	EntitySkeletonFields,
} from "@/shared/components/entity-fields";
import { SectionTitle } from "@/shared/components/section-title";
import {
	Button,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	ScrollArea,
	Separator,
	Skeleton,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { OverlayState } from "@/shared/types/overlay";

interface SectionClassNames {
	root?: string;
	title?: string;
	content?: string;
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
			modal={false}
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

function Body({
	children,
	className,
	...props
}: React.ComponentProps<typeof ScrollArea>) {
	return (
		<ScrollArea className={cn("min-h-0 flex-1 px-4", className)} {...props}>
			<div className="flex flex-col gap-3">{children}</div>
		</ScrollArea>
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
	return <Skeleton className={cn("h-7 w-40", className)} />;
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
			<SectionTitle className={cn(classNames?.title)}>{title}</SectionTitle>
			<div className={cn(classNames?.content)}>{children}</div>
		</section>
	);
};

export const EntityDetail = {
	Root,
	Content,
	Header,
	Title,
	Body,
	Footer,
	Section,
	Fields: EntityFields,
	SkeletonFields: EntitySkeletonFields,
	SkeletonTitle,
	Separator,
};

export type { DetailFieldItem };
