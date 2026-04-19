import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Dashboard,
	getDashboardSummaryQueryOptions,
} from "@/features/dashboard";
import { RouteError } from "@/shared/components/route-error";
import { RouteLoading } from "@/shared/components/route-loading";
import { Wrapper } from "@/shared/components/wrapper";
import { getLoggedUserSession } from "@/shared/session";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		getLoggedUserSession();
	},
	loader: async ({ context: { queryClient } }) => {
		await queryClient.ensureQueryData(getDashboardSummaryQueryOptions());
	},
	pendingComponent: () => <RouteLoading />,
	errorComponent: ({ error }) => <RouteError error={error} />,
	component: App,
});

function App() {
	const { data } = useSuspenseQuery(getDashboardSummaryQueryOptions());

	return (
		<Wrapper title="Dashboard">
			<Wrapper.Body>
				<Dashboard data={data} />
			</Wrapper.Body>
		</Wrapper>
	);
}
