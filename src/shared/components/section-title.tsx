import type * as React from "react";
import { cn } from "@/shared/lib/utils";

interface SectionTitleProps extends React.ComponentPropsWithoutRef<"h2"> {}

export const SectionTitle = ({
	className,
	children,
	...props
}: SectionTitleProps) => {
	return (
		<h2
			className={cn(
				"text-xs font-medium uppercase tracking-widest text-muted-foreground",
				className,
			)}
			{...props}
		>
			{children}
		</h2>
	);
};
