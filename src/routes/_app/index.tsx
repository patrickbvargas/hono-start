import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	BriefcaseIcon,
	PlusIcon,
	UserIcon,
	WalletCardsIcon,
} from "lucide-react";
import {
	ContractDetails,
	ContractForm,
	getContractAssignmentTypesQueryOptions,
	getContractLegalAreasQueryOptions,
	getContractRevenueTypesQueryOptions,
	getContractStatusesQueryOptions,
	getSelectableContractClientsQueryOptions,
	getSelectableContractEmployeesQueryOptions,
} from "@/features/contracts";
import {
	Dashboard,
	DashboardFilter,
	dashboardSearchDefaults,
	dashboardSearchSchema,
	getDashboardEmployeeOptionsQueryOptions,
	getDashboardSummaryQueryOptions,
	isExpenseOnlyDashboard,
	useDashboardData,
	useDashboardDetailsPreference,
} from "@/features/dashboard";
import {
	ExpenseForm,
	getExpenseCategoriesQueryOptions,
} from "@/features/expenses";
import {
	getEmployeeTypesQueryOptions,
	getPersonTypesQueryOptions,
	PersonDetails,
	PersonForm,
} from "@/features/people";
import { RouteError } from "@/shared/components/route-error";
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/ui";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import {
	assertCan,
	hasPermission,
	useLoggedUserSession,
} from "@/shared/session";

export const Route = createFileRoute("/_app/")({
	staticData: { pageTitle: ROUTES.dashboard.title },
	validateSearch: dashboardSearchSchema,
	search: {
		middlewares: [stripSearchParams(dashboardSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient, session }, deps: { search } }) => {
		assertCan(session, [
			"org:dashboard:read_all",
			"org:dashboard:read_own",
			"org:expenses:read",
		]);
		const prefetches = [
			queryClient.query(getDashboardSummaryQueryOptions(search)),
			queryClient.query(getDashboardEmployeeOptionsQueryOptions()),
		];

		if (
			hasPermission(session, "org:clients:create") ||
			hasPermission(session, "org:employees:create") ||
			hasPermission(session, "org:suppliers:create") ||
			hasPermission(session, "org:people:create")
		) {
			await Promise.all([
				queryClient.query(getPersonTypesQueryOptions()),
				queryClient.query(getEmployeeTypesQueryOptions()),
			]);
		}
		if (
			hasPermission(session, "org:contracts:create") ||
			(["org:contracts:read_all", "org:contracts:read_assigned"] as const).some(
				(permission) => hasPermission(session, permission),
			)
		) {
			await Promise.all([
				queryClient.query(getSelectableContractClientsQueryOptions()),
				queryClient.query(getSelectableContractEmployeesQueryOptions()),
				queryClient.query(getContractLegalAreasQueryOptions()),
				queryClient.query(getContractStatusesQueryOptions()),
				queryClient.query(getContractAssignmentTypesQueryOptions()),
				queryClient.query(getContractRevenueTypesQueryOptions()),
			]);
		}
		if (hasPermission(session, "org:expenses:create")) {
			await queryClient.query(getExpenseCategoriesQueryOptions());
		}

		await Promise.all(prefetches);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title="Visão geral" error={error} />
	),
});

function RouteComponent() {
	const search = Route.useSearch();
	const { summary } = useDashboardData(search);
	const { showDetails, handleShowDetailsChange } =
		useDashboardDetailsPreference();
	const session = useLoggedUserSession();
	const isAdmin = hasPermission(session, "org:dashboard:read_all");
	const personOverlay = useOverlay<EntityId>();
	const contractOverlay = useOverlay<EntityId>();
	const expenseOverlay = useOverlay<EntityId>();
	const canCreate = (
		[
			"org:clients:create",
			"org:contracts:create",
			"org:employees:create",
			"org:suppliers:create",
			"org:people:create",
			"org:expenses:create",
		] as const
	).some((permission) => hasPermission(session, permission));

	return (
		<Wrapper
			title={ROUTES.dashboard.title}
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
			actions={
				canCreate ? (
					<DropdownMenu>
						<DropdownMenuTrigger render={<Button size="sm" />}>
							<PlusIcon size={16} />
							Novo
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{hasPermission(session, "org:contracts:create") ? (
								<DropdownMenuItem
									onClick={() => contractOverlay.overlay.create.open()}
								>
									<BriefcaseIcon size={16} />
									Contrato
								</DropdownMenuItem>
							) : null}
							{hasPermission(session, "org:clients:create") ||
							hasPermission(session, "org:employees:create") ||
							hasPermission(session, "org:suppliers:create") ||
							hasPermission(session, "org:people:create") ? (
								<DropdownMenuItem
									onClick={() => personOverlay.overlay.create.open()}
								>
									<UserIcon size={16} />
									Pessoa
								</DropdownMenuItem>
							) : null}
							{hasPermission(session, "org:expenses:create") ? (
								<DropdownMenuItem
									onClick={() => expenseOverlay.overlay.create.open()}
								>
									<WalletCardsIcon size={16} />
									Despesa
								</DropdownMenuItem>
							) : null}
						</DropdownMenuContent>
					</DropdownMenu>
				) : null
			}
		>
			<WrapperHeader>
				<DashboardFilter
					showAllocationFilters={Boolean(
						summary.visibility?.revenue || summary.visibility?.remuneration,
					)}
					isAdmin={isAdmin && hasPermission(session, "org:employees:read")}
					showDetails={showDetails}
					onShowDetailsChange={handleShowDetailsChange}
					showDetailsToggle={!isExpenseOnlyDashboard(summary.visibility)}
				/>
			</WrapperHeader>
			<WrapperBody>
				<Dashboard
					key={JSON.stringify(search)}
					data={summary}
					search={search}
					onViewEmployee={
						hasPermission(session, "org:employees:read") ||
						hasPermission(session, "org:people:read")
							? personOverlay.overlay.details.open
							: undefined
					}
					showDetails={showDetails}
					onViewContract={
						hasPermission(session, "org:contracts:read_all") ||
						hasPermission(session, "org:contracts:read_assigned")
							? contractOverlay.overlay.details.open
							: undefined
					}
				/>
				{personOverlay.overlay.create.render((state) => (
					<PersonForm state={state} onSuccess={state.close} />
				))}
				{personOverlay.overlay.details.render((id, state) => (
					<PersonDetails id={id} state={state} />
				))}
				{contractOverlay.overlay.create.render((state) => (
					<ContractForm state={state} onSuccess={state.close} />
				))}
				{contractOverlay.overlay.details.render((id, state) => (
					<ContractDetails id={id} state={state} />
				))}
				{expenseOverlay.overlay.create.render((state) => (
					<ExpenseForm state={state} onSuccess={state.close} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
