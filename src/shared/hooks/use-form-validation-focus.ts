import * as React from "react";

interface UseFormValidationFocusOptions {
	attempts: number;
	valid: boolean;
	submitting: boolean;
	validating: boolean;
	isOpen: boolean;
}
export function useFormValidationFocus({
	attempts,
	valid,
	submitting,
	validating,
	isOpen,
}: UseFormValidationFocusOptions) {
	const contentRef = React.useRef<HTMLDivElement>(null);
	const previousAttempt = React.useRef(0);
	React.useEffect(() => {
		if (
			!isOpen ||
			!attempts ||
			submitting ||
			validating ||
			previousAttempt.current === attempts
		) {
			return;
		}
		if (valid) {
			previousAttempt.current = attempts;
			return;
		}
		let secondFrame = 0;
		const frame = requestAnimationFrame(() => {
			secondFrame = requestAnimationFrame(() => {
				const controls = contentRef.current?.querySelectorAll<HTMLElement>(
					'input[aria-invalid="true"],textarea[aria-invalid="true"],button[aria-invalid="true"],[data-invalid="true"] input,[data-invalid="true"] button,[data-invalid="true"] [tabindex="0"]',
				);
				const control = Array.from(controls ?? []).find(
					(el) =>
						!el.closest('[hidden],[aria-hidden="true"]') &&
						!el.hasAttribute("disabled") &&
						el.getAttribute("type") !== "hidden",
				);
				control?.focus();
				control?.scrollIntoView?.({ block: "nearest" });
				previousAttempt.current = attempts;
			});
		});
		return () => {
			cancelAnimationFrame(frame);
			cancelAnimationFrame(secondFrame);
		};
	}, [attempts, valid, submitting, validating, isOpen]);
	return contentRef;
}
