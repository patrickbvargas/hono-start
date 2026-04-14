import type {
	DescriptionProps,
	FieldErrorProps,
	FieldGroupProps,
	LabelProps,
} from "@heroui/react";
import {
	Description,
	FieldError as HFieldError,
	FieldGroup as HFieldGroup,
	Label,
} from "@heroui/react";
import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface FieldLabelProps extends LabelProps {
	label?: string;
}

const FieldLabel = ({ label, ...props }: FieldLabelProps) => {
	if (!label) return null;

	return <Label {...props}>{label}</Label>;
};

interface FieldDescriptionProps extends DescriptionProps {
	description?: string;
}

const FieldDescription = ({ description, ...props }: FieldDescriptionProps) => {
	if (!description) return null;

	return <Description {...props}>{description}</Description>;
};

interface FieldError extends FieldErrorProps {
	errors?: Array<{ message?: string } | undefined>;
}

const FieldError = ({ errors, children, ...props }: FieldError) => {
	const content = React.useMemo(() => {
		if (children) return children;

		const messages = errors?.map((e) => e?.message).filter(Boolean) as string[];

		if (!messages?.length) return null;

		const unique = [...new Set(messages)];

		if (unique.length === 1) return unique[0];

		return unique.map((msg) => <div key={msg}>{msg}</div>);
	}, [children, errors]);

	if (!content) return null;

	return <HFieldError {...props}>{content}</HFieldError>;
};

const FieldGroup = ({ children, className, ...props }: FieldGroupProps) => {
	return (
		<HFieldGroup
			className={cn(
				"w-full p-1 overflow-hidden grid grid-cols-1 gap-3",
				className,
			)}
			{...props}
		>
			{children}
		</HFieldGroup>
	);
};

export const Field = {
	Label: FieldLabel,
	Description: FieldDescription,
	Error: FieldError,
	Group: FieldGroup,
};
