import { Switch, type SwitchProps } from "@heroui/react";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import { Field } from "../hui/field";
import type { FieldCommonProps } from "./types";

interface FormSwitchProps extends SwitchProps, FieldCommonProps {
	isRequired?: boolean;
}

export const FormSwitch = ({
	label,
	description,
	isRequired,
	classNames,
	...props
}: FormSwitchProps) => {
	const field = useFieldContext<boolean>();

	return (
		<Switch
			name={field.name}
			isSelected={field.state.value}
			onBlur={field.handleBlur}
			onChange={field.handleChange}
			className={classNames?.wrapper}
			{...props}
		>
			<Switch.Control>
				<Switch.Thumb />
			</Switch.Control>
			<Switch.Content>
				<Field.Label
					label={label}
					htmlFor={field.name}
					isRequired={isRequired}
					className={classNames?.label}
				/>
				<Field.Description
					description={description}
					className={classNames?.description}
				/>
				<Field.Error
					errors={field.state.meta.errors}
					className={classNames?.error}
				/>
			</Switch.Content>
		</Switch>
	);
};
