import { Separator, SidebarTrigger } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { ValueVisibilityToggle } from "./value-visibility";

interface WrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	title?: string;
	actions?: React.ReactNode;
	titleAside?: React.ReactNode;
}

export const Wrapper = ({
	title,
	titleAside,
	actions,
	children,
	className,
	...props
}: WrapperProps) => {
	return (
		<div
			data-slot="wrapper"
			className={cn(
				"relative flex h-full min-h-0 flex-col gap-3 overflow-clip",
				className,
			)}
			{...props}
		>
			<div
				data-slot="wrapper-header-bar"
				className="h-12 shrink-0 flex items-center justify-between gap-2 px-4 pt-1.5"
			>
				<div className="flex items-center gap-2">
					<SidebarTrigger />
					<Separator orientation="vertical" className="my-auto h-4" />
					{title && <WrapperTitle title={title} />}
					{titleAside}
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<ValueVisibilityToggle />
					{actions}
				</div>
			</div>
			{children}
		</div>
	);
};

export const WrapperHeader = ({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			data-slot="wrapper-header"
			className={cn("flex items-center justify-between px-4 gap-3", className)}
			{...props}
		>
			{children}
		</div>
	);
};

export const WrapperBody = ({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			data-slot="wrapper-content"
			className={cn(
				"flex flex-1 min-h-0 w-full flex-col px-4 pb-4 overflow-hidden",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
};

export const WrapperFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			data-slot="wrapper-footer"
			className={cn("flex justify-end items-center gap-3 px-4 pb-4", className)}
			{...props}
		/>
	);
};

interface WrapperTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
	title: string;
}
export const WrapperTitle = ({
	title,
	className,
	...props
}: WrapperTitleProps) => (
	<h1 className={cn("text-base font-medium", className)} {...props}>
		{title}
	</h1>
);
