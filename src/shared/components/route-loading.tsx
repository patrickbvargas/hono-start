import { useRouterState } from "@tanstack/react-router";
import { Spinner } from "@/shared/components/ui";

export const RouteLoading = () => {
	const { isLoading } = useRouterState();

	if (!isLoading) return null;

	return <Spinner />;
};
