import { cn } from "@/shared/lib/utils";

interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
	title?: string;
	actions?: React.ReactNode;
}

export const Root = ({
	title,
	actions,
	children,
	className,
	...props
}: RootProps) => {
	return (
		<div
			data-slot="wrapper"
			className={cn("flex flex-col gap-3 h-full", className)}
			{...props}
		>
			<div className="h-12 flex items-center justify-between px-4 pt-1.5">
				{title && <Title title={title} />}
				{actions}
			</div>
			{children}
		</div>
	);
};

export const Header = ({
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

export const Body = ({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			data-slot="wrapper-content"
			className={cn(
				"h-full w-full overflow-hidden flex flex-col px-4 gap-3",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
};

export const Footer = ({
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
export const Title = ({ title, className, ...props }: WrapperTitleProps) => (
	<h1 className={cn("text-base font-medium", className)} {...props}>
		{title}
	</h1>
);

export const Wrapper = Object.assign(Root, {
	Header,
	Body,
	Footer,
	Title,
});
