import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

export function useRouteRecovery() {
	const router = useRouter();
	const [isRetrying, setIsRetrying] = useState(false);
	const retry = async () => {
		setIsRetrying(true);
		try {
			await router.invalidate();
		} catch (error) {
			console.error("[retryRoute]", error);
		} finally {
			setIsRetrying(false);
		}
	};
	return { retry, isRetrying };
}
