import { Separator, SidebarTrigger } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface WrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	title?: string;
	actions?: React.ReactNode;
}

export const Wrapper = ({
	title,
	actions,
	children,
	className,
	...props
}: WrapperProps) => {
	return (
		<div
			data-slot="wrapper"
			className={cn(
				"flex h-full min-h-0 flex-col gap-3 overflow-hidden",
				className,
			)}
			{...props}
		>
			<div className="h-12 flex items-center justify-between px-4 pt-1.5">
				<div className="flex items-center gap-0.5">
					<SidebarTrigger />
					<Separator
						orientation="vertical"
						className="mx-2 my-auto data-[orientation=vertical]:h-4"
					/>
					{title && <WrapperTitle title={title} />}
				</div>
				{actions}
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
			className={cn("flex items-center justify-between px-4", className)}
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
				"flex flex-1 min-h-0 w-full flex-col overflow-hidden",
				className,
			)}
			{...props}
		>
			<div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
				{children}
			</div>
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
