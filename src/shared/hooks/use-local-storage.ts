import * as React from "react";
import type * as z from "zod";

interface UseLocalStorageOptions<T> {
	schema: z.ZodType<T>;
	defaultValue?: T;
}

export function useLocalStorage<T>(
	key: string,
	initialValue: T,
	{ schema, defaultValue = initialValue }: UseLocalStorageOptions<T>,
): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [value, setValue] = React.useState(initialValue);
	const currentValue = React.useRef(value);
	currentValue.current = value;

	React.useEffect(() => {
		try {
			const stored = window.localStorage.getItem(key);
			const parsed = schema.safeParse(
				stored === null ? defaultValue : JSON.parse(stored),
			);
			const nextValue = parsed.success ? parsed.data : defaultValue;
			currentValue.current = nextValue;
			setValue(nextValue);
		} catch {
			// Preserve the initial state when browser storage cannot be read.
		}
	}, [key, schema, defaultValue]);

	const setStoredValue = React.useCallback<
		React.Dispatch<React.SetStateAction<T>>
	>(
		(nextValue) => {
			const resolvedValue =
				nextValue instanceof Function
					? nextValue(currentValue.current)
					: nextValue;
			currentValue.current = resolvedValue;
			setValue(resolvedValue);
			try {
				window.localStorage.setItem(key, JSON.stringify(resolvedValue));
			} catch {
				// Keep controls usable in memory when persistence is unavailable.
			}
		},
		[key],
	);

	return [value, setStoredValue];
}
