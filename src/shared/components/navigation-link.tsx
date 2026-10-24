import { createLink } from "@tanstack/react-router";
import { ArrowUpRightIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";
export const NavigationLink = createLink(
	({ children, className, ...props }: ComponentProps<"a">) => (
		<a
			{...props}
			className={cn(
				"inline-flex max-w-full items-baseline gap-1 rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				className,
			)}
		>
			<span className="min-w-0 wrap-break-word">{children}</span>
			<ArrowUpRightIcon
				aria-hidden="true"
				className="relative top-0.5 size-3.5 shrink-0"
			/>
		</a>
	),
);
