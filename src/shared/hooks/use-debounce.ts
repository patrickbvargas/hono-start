import * as React from "react";

export function useDebounce<T extends (...args: never[]) => void>(
	fn: T,
	delay: number,
): (...args: Parameters<T>) => void {
	const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const fnRef = React.useRef<T>(fn);

	React.useLayoutEffect(() => {
		fnRef.current = fn;
	});

	React.useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	return React.useCallback(
		(...args: Parameters<T>) => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
			timerRef.current = setTimeout(() => {
				fnRef.current(...args);
			}, delay);
		},
		[delay],
	);
}
