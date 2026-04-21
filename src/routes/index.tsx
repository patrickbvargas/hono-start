import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	Dashboard,
	DashboardFilter,
	dashboardSearchSchema,
	getDashboardSummaryQueryOptions,
} from "@/features/dashboard";
import { RouteError } from "@/shared/components/route-error";
import { RouteLoading } from "@/shared/components/route-loading";
import { Wrapper } from "@/shared/components/wrapper";
import {
	getLoggedUserSession,
	isAdminSession,
	useLoggedUserSessionStore,
} from "@/shared/session";

export const Route = createFileRoute("/")({
	validateSearch: zodValidator(dashboardSearchSchema),
	beforeLoad: () => {
		getLoggedUserSession();
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getDashboardSummaryQueryOptions(search));
	},
	pendingComponent: () => <RouteLoading />,
	errorComponent: ({ error }) => <RouteError error={error} />,
	component: App,
});

function App() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getDashboardSummaryQueryOptions(search));
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	return (
		<Wrapper title="Dashboard">
			<Wrapper.Header>
				<DashboardFilter isAdmin={isAdmin} />
				<RouteLoading />
			</Wrapper.Header>
			<Wrapper.Body>
				<Dashboard data={data} />
			</Wrapper.Body>
		</Wrapper>
	);
}
