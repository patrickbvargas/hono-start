import { useRouterState } from "@tanstack/react-router";
import { Spinner } from "@/shared/components/Hui";

export const RouteLoading = () => {
	const { isLoading } = useRouterState();

	if (!isLoading) return null;

	return <Spinner />;
};
