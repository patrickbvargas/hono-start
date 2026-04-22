import * as React from "react";

export function useLocalStorage<T>(
	key: string,
	initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [value, setValue] = React.useState<T>(() => {
		if (typeof window === "undefined") return initialValue;
		const stored = window.localStorage.getItem(key);
		return stored ? JSON.parse(stored) : initialValue;
	});

	React.useEffect(() => {
		window.localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue];
}
