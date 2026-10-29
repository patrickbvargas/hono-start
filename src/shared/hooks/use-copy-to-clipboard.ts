import { useEffect, useRef, useState } from "react";

export function useCopyToClipboard(value: string | null | undefined) {
	const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const request = useRef(0);
	const pending = useRef(false);
	const currentValue = useRef(value);

	useEffect(() => {
		currentValue.current = value;
		setStatus("idle");
		pending.current = false;
		return () => {
			request.current += 1;
			clearTimeout(timer.current);
		};
	}, [value]);

	async function copy() {
		if (!value?.trim() || pending.current) {
			return;
		}
		const currentRequest = ++request.current;
		pending.current = true;
		clearTimeout(timer.current);
		setStatus("idle");
		try {
			await navigator.clipboard.writeText(value);
			if (
				currentRequest === request.current &&
				currentValue.current === value
			) {
				setStatus("copied");
			}
		} catch {
			if (currentRequest === request.current) {
				setStatus("error");
			}
		} finally {
			if (currentRequest === request.current) {
				pending.current = false;
				timer.current = setTimeout(() => setStatus("idle"), 2000);
			}
		}
	}

	return { copy, status };
}
