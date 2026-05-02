import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	getContractLegalAreasQueryOptions,
	getContractRevenueTypesQueryOptions,
} from "@/features/contracts";
import {
	Dashboard,
	DashboardFilter,
	dashboardSearchDefaults,
	dashboardSearchSchema,
	getDashboardEmployeeOptionsQueryOptions,
	getDashboardSummaryQueryOptions,
	useDashboardData,
} from "@/features/dashboard";
import { RouteLoading } from "@/shared/components/route-loading";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";

export const Route = createFileRoute("/_app/")({
	validateSearch: zodValidator(dashboardSearchSchema),
	search: {
		middlewares: [stripSearchParams(dashboardSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.ensureQueryData(getDashboardSummaryQueryOptions(search)),
			queryClient.ensureQueryData(getDashboardEmployeeOptionsQueryOptions()),
			queryClient.ensureQueryData(getContractLegalAreasQueryOptions()),
			queryClient.ensureQueryData(getContractRevenueTypesQueryOptions()),
		]);
	},
	pendingComponent: () => <RouteLoading />,
	component: RouteComponent,
});

function RouteComponent() {
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
