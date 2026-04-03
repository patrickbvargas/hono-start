import type {
	DescriptionProps,
	FieldErrorProps,
	LabelProps,
} from "@heroui/react";
import {
	Description,
	FieldGroup,
	FieldError as HeroFieldError,
	Label,
} from "@heroui/react";
import * as React from "react";

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

	return <HeroFieldError {...props}>{content}</HeroFieldError>;
};

export const Field = {
	Label: FieldLabel,
	Description: FieldDescription,
	Error: FieldError,
	Group: FieldGroup,
};
