import type * as React from "react";
import { createContext, useContext } from "react";
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

const DetailDepthContext = createContext(0);

interface RootProps {
	state: OverlayState;
	children: React.ReactNode;
}

function Root({ state, children, ...props }: RootProps) {
	const depth = useContext(DetailDepthContext);
	const container =
		typeof document === "undefined"
			? null
			: document.querySelector<HTMLElement>('[data-slot="root-container"]');

	return (
		<DetailDepthContext value={depth + 1}>
			<Drawer
				open={state.isOpen}
				onOpenChange={state.onOpenChange}
				disablePointerDismissal
				modal={false}
				{...props}
			>
				<DrawerContent
					container={container ?? undefined}
					direction="right"
					className="data-[direction=right]:w-full data-[direction=right]:sm:max-w-xl"
				>
					{children}
				</DrawerContent>
			</Drawer>
		</DetailDepthContext>
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
	const depth = useContext(DetailDepthContext);
	return (
		<DrawerFooter {...props}>
			{children ?? (
				<DrawerClose render={<Button variant="outline" className="w-full" />}>
					{depth > 1 ? "Voltar" : "Fechar"}
				</DrawerClose>
			)}
		</DrawerFooter>
	);
}

function SkeletonTitle({ className }: React.ComponentProps<"div">) {
	return <Skeleton className={cn("h-6 w-40", className)} />;
}

interface SkeletonHeaderProps {
	withActions?: boolean;
}

function SkeletonHeader({ withActions = false }: SkeletonHeaderProps) {
	return (
		<Header
			className={
				withActions ? "flex-row items-center justify-between gap-3" : undefined
			}
		>
			<Title>
				<span className="sr-only">Carregando detalhes</span>
				<SkeletonTitle />
			</Title>
			{withActions ? <Skeleton className="size-7 shrink-0" /> : null}
		</Header>
	);
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
	SkeletonHeader,
	Separator,
};

export type { DetailFieldItem };
