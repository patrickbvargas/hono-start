import type * as React from "react";
import { SectionTitle } from "@/shared/components/section-title";
import { FieldGroup } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface FormSectionProps
	extends React.ComponentPropsWithoutRef<typeof FieldGroup> {
	title?: string;
	description?: React.ReactNode;
	action?: React.ReactNode;
	variant?: "card" | "plain";
}

export const FormSection = ({
	title,
	description,
	action,
	variant = "card",
	className,
	children,
	...props
}: FormSectionProps) => {
	return (
		<section
			data-slot="form-section"
			className={cn(
				"flex flex-col gap-4",
				(variant === "plain" || action) && "gap-2",
				variant === "card" &&
					"rounded-xl border bg-card p-4 text-card-foreground",
			)}
		>
			{title || description || action ? (
				<div
					className={
						description || !action
							? "flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
							: "flex items-center justify-between gap-3"
					}
				>
					<div className="space-y-1">
						{title ? (
							<SectionTitle
								className={
									variant === "card"
										? "text-sm font-medium normal-case tracking-normal text-foreground leading-none"
										: undefined
								}
							>
								{title}
							</SectionTitle>
						) : null}
						{description ? (
							<p className="text-muted-foreground text-sm">{description}</p>
						) : null}
					</div>
					{action ? <div className="shrink-0">{action}</div> : null}
				</div>
			) : null}
			<FieldGroup className={cn("gap-4", className)} {...props}>
				{children}
			</FieldGroup>
		</section>
	);
};
