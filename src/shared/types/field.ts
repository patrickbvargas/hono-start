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
	id?: number | string;
}

export interface FieldCommonProps {
	label?: string;
	description?: string;
	classNames?: FieldClassNames;
}
