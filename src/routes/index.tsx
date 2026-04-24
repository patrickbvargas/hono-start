import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	Dashboard,
	DashboardFilter,
	dashboardSearchSchema,
	getDashboardSummaryQueryOptions,
	useDashboardData,
} from "@/features/dashboard";
import { RouteError } from "@/shared/components/route-error";
import { RouteLoading } from "@/shared/components/route-loading";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
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
	const { summary } = useDashboardData(search);
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	return (
		<Wrapper title="Dashboard">
			<WrapperHeader>
				<DashboardFilter isAdmin={isAdmin} />
				<RouteLoading />
			</WrapperHeader>
			<WrapperBody>
				<Dashboard data={summary} />
			</WrapperBody>
		</Wrapper>
	);
}
