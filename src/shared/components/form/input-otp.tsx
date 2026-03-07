import { useFieldContext } from "@/shared/hooks/use-app-form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import type { FieldCommonProps } from "./types";
import { FormDescription, FormError, FormField, FormLabel } from "./utils";

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
		<FormField data-invalid={isInvalid} className={classNames?.wrapper}>
			<FormLabel
				label={label}
				htmlFor={field.name}
				isRequired={isRequired}
				className={classNames?.label}
			/>
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
			<FormDescription
				description={description}
				className={classNames?.description}
			/>
			<FormError
				errors={field.state.meta.errors}
				className={classNames?.error}
			/>
		</FormField>
	);
};
