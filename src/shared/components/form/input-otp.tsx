import * as React from "react";
import { Field, InputOTP, type InputOTPProps } from "@/shared/components/ui";
import { useFieldContext } from "@/shared/hooks/use-app-form";
import type { FieldCommonProps } from "@/shared/types/field";

interface FormInputOTPProps
	extends Omit<InputOTPProps, "children">,
		FieldCommonProps {
	isRequired?: boolean;
}

export const FormInputOTP = ({
	label,
	description,
	isRequired,
	maxLength = 6,
	classNames,
	...props
}: FormInputOTPProps) => {
	const field = useFieldContext<string>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	const slots = React.useMemo(
		() => Array.from({ length: maxLength }, (_, i) => `otp-${i}`),
		[maxLength],
	);

	return (
		<div className="flex flex-col gap-2">
			<Field.Label
				label={label}
				htmlFor={field.name}
				isRequired={isRequired}
				className={classNames?.label}
			/>
			<InputOTP
				name={field.name}
				maxLength={maxLength}
				isInvalid={isInvalid}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={field.handleChange}
				className={classNames?.wrapper}
				{...props}
			>
				<InputOTP.Group>
					{slots.map((key, index) => (
						<InputOTP.Slot key={key} index={index} />
					))}
				</InputOTP.Group>
			</InputOTP>
			{!isInvalid ? (
				<Field.Description
					description={description}
					className={classNames?.description}
				/>
			) : (
				<Field.Error
					errors={field.state.meta.errors}
					className={classNames?.error}
				/>
			)}
		</div>
	);
};
