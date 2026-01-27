import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

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
			className={cn("flex flex-col gap-3 p-4 pt-1.5 h-full", className)}
			{...props}
		>
			<div className="h-12 flex items-center justify-between">
				<div className="flex items-center gap-1">
					<SidebarTrigger />
					<Separator
						orientation="vertical"
						className="mx-2 data-[orientation=vertical]:h-4"
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
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div data-slot="wrapper-header" {...props}>
			{children}
		</div>
	);
};

export const WrapperBody = ({
	children,
	className,
	...props
}: React.ComponentProps<typeof ScrollArea>) => {
	return (
		<ScrollArea
			data-slot="wrapper-content"
			className={cn("h-full w-full overflow-hidden", className)}
			{...props}
		>
			<div className={cn("flex flex-col gap-3", className)}>{children}</div>
		</ScrollArea>
	);
};

export const WrapperFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			data-slot="wrapper-footer"
			className={cn("flex justify-end items-center gap-3", className)}
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
