export interface FieldClassNames {
	wrapper?: string;
	label?: string;
	description?: string;
	error?: string;
}

export interface FieldOption {
	value: string;
	label: string;
	isDisabled?: boolean;
}

export interface FieldCommonProps {
	label?: string;
	description?: string;
	isRequired?: boolean;
	isDisabled?: boolean;
	classNames?: FieldClassNames;
}
