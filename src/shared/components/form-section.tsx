import type * as React from "react";
import { FieldGroup } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface FormSectionProps
	extends React.ComponentPropsWithoutRef<typeof FieldGroup> {
	title?: string;
	description?: React.ReactNode;
	action?: React.ReactNode;
}

export const FormSection = ({
	title,
	description,
	action,
	className,
	children,
	...props
}: FormSectionProps) => {
	return (
		<section data-slot="form-section" className="flex flex-col gap-3">
			{title || description || action ? (
				<div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
					<div className="space-y-1">
						{title ? (
							<h2 className="font-medium text-foreground text-sm leading-none">
								{title}
							</h2>
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
