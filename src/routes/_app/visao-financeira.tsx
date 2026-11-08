import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	FinancialOverview,
	FinancialOverviewFilter,
	financialOverviewSearchDefaults,
	financialOverviewSearchSchema,
	getFinancialOverviewOptionsQueryOptions,
	getFinancialOverviewSummaryQueryOptions,
	useFinancialOverviewData,
	useFinancialOverviewDetailsPreference,
} from "@/features/financial-overview";
import { RouteError } from "@/shared/components/route-error";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { formatter } from "@/shared/lib/formatter";
import { assertCan } from "@/shared/session";

export const Route = createFileRoute("/_app/visao-financeira")({
	staticData: { pageTitle: ROUTES.financialOverview.title },
	validateSearch: financialOverviewSearchSchema,
	search: {
		middlewares: [stripSearchParams(financialOverviewSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient, session }, deps: { search } }) => {
		assertCan(session, [
			"org:financial_overview:read_all",
			"org:cash_flow:read_all",
			"org:payables:read_all",
		]);

		await Promise.all([
			queryClient.query(getFinancialOverviewSummaryQueryOptions(search)),
			queryClient.query(getFinancialOverviewOptionsQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title="Visão financeira" error={error} />
	),
});

function RouteComponent() {
	const search = Route.useSearch();
	const { summary } = useFinancialOverviewData(search);
	const { showDetails, handleShowDetailsChange } =
		useFinancialOverviewDetailsPreference();

	return (
		<Wrapper
			title={ROUTES.financialOverview.title}
			titleAside={
				<span className="text-xs text-muted-foreground">
					{search.dateFrom
						? formatter.calendarDate(search.dateFrom)
						: "Sem limite inicial"}{" "}
					–{" "}
					{search.dateTo
						? formatter.calendarDate(search.dateTo)
						: "sem limite final"}
				</span>
			}
		>
			<WrapperHeader>
				<FinancialOverviewFilter
					showDetails={showDetails}
					onShowDetailsChange={handleShowDetailsChange}
				/>
			</WrapperHeader>
			<WrapperBody>
				<FinancialOverview data={summary} showDetails={showDetails} />
			</WrapperBody>
		</Wrapper>
	);
}
