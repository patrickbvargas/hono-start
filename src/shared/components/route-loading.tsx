import { useRouterState } from "@tanstack/react-router";
import * as React from "react";
import { Progress } from "@/shared/components/ui";

export const RouteLoading = () => {
	const { isLoading } = useRouterState();
	const [progress, setProgress] = React.useState(10);

	React.useEffect(() => {
		if (!isLoading) {
			setProgress(0);
			return;
		}

		setProgress(10);

		const timers = [
			setTimeout(() => setProgress(35), 150),
			setTimeout(() => setProgress(66), 400),
			setTimeout(() => setProgress(85), 900),
		];

		return () => {
			timers.forEach(clearTimeout);
		};
	}, [isLoading]);

	if (!isLoading) return null;

	return (
		<Progress
			value={progress}
			className="fixed left-0 top-0 z-50 w-full rounded-none"
		/>
	);
};
