import { useFieldContext } from "@/shared/hooks/use-app-form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import type { FieldCommonProps } from "./types";
import { FormFieldWrapper } from "./utils/wrapper";

interface FormInputOTPProps extends FieldCommonProps {
	maxLength?: number;
}

export const FormInputOTP = ({
	label,
	description,
	isRequired,
	isDisabled,
	maxLength = 6,
	classNames,
	...props
}: FormInputOTPProps) => {
	const field = useFieldContext<string>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FormFieldWrapper
			id={field.name}
			label={label}
			description={description}
			isRequired={isRequired}
			errors={field.state.meta.errors}
			data-invalid={isInvalid}
			className={classNames?.wrapper}
		>
			<InputOTP
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={field.handleChange}
				maxLength={maxLength}
				disabled={isDisabled}
				required={isRequired}
				{...props}
			>
				<InputOTPGroup>
					{Array.from({ length: maxLength }, (_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: without index, this is not a list
						<InputOTPSlot key={index} index={index} aria-invalid={isInvalid} />
					))}
				</InputOTPGroup>
			</InputOTP>
		</FormFieldWrapper>
	);
};
