import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	BriefcaseIcon,
	DollarSignIcon,
	PlusIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import { ClientForm, getClientTypesQueryOptions } from "@/features/clients";
import {
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
	useDashboardData,
} from "@/features/dashboard";
import {
	EmployeeForm,
	getEmployeeTypesQueryOptions,
} from "@/features/employees";
import {
	FeeForm,
	getSelectableFeeContractsQueryOptions,
	getSelectableFeeRevenuesQueryOptions,
} from "@/features/fees";
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
import { getPageTitle, ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import {
	assertCan,
	hasPermission,
	useLoggedUserSession,
} from "@/shared/session";

export const Route = createFileRoute("/_app/")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.dashboard.title) }],
	}),
	validateSearch: dashboardSearchSchema,
	search: {
		middlewares: [stripSearchParams(dashboardSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient, session }, deps: { search } }) => {
		assertCan(session, ["org:dashboard:read_all", "org:dashboard:read_own"]);
		const prefetches = [
			queryClient.query(getDashboardSummaryQueryOptions(search)),
			queryClient.query(getDashboardEmployeeOptionsQueryOptions()),
		];

		if (hasPermission(session, "org:clients:create")) {
			await queryClient.query(getClientTypesQueryOptions());
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
		if (
			(["org:fees:read_all", "org:fees:read_assigned"] as const).some(
				(permission) => hasPermission(session, permission),
			)
		) {
			await Promise.all([
				queryClient.query(getSelectableFeeContractsQueryOptions()),
				queryClient.query(getSelectableFeeRevenuesQueryOptions()),
			]);
		}
		if (hasPermission(session, "org:employees:create")) {
			await Promise.all([queryClient.query(getEmployeeTypesQueryOptions())]);
		}

		await Promise.all(prefetches);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => <RouteError title="Dashboard" error={error} />,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { summary } = useDashboardData(search);
	const session = useLoggedUserSession();
	const isAdmin = hasPermission(session, "org:dashboard:read_all");
	const clientOverlay = useOverlay<EntityId>();
	const contractOverlay = useOverlay<EntityId>();
	const feeOverlay = useOverlay<EntityId>();
	const employeeOverlay = useOverlay<EntityId>();

	return (
		<Wrapper
			title={ROUTES.dashboard.title}
			actions={
				<DropdownMenu>
					<DropdownMenuTrigger render={<Button />}>
						<PlusIcon size={16} />
						Novo
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{hasPermission(session, "org:clients:create") ? (
							<DropdownMenuItem
								onClick={() => clientOverlay.overlay.create.open()}
							>
								<UserIcon size={16} />
								Cliente
							</DropdownMenuItem>
						) : null}
						{hasPermission(session, "org:contracts:create") ? (
							<DropdownMenuItem
								onClick={() => contractOverlay.overlay.create.open()}
							>
								<BriefcaseIcon size={16} />
								Contrato
							</DropdownMenuItem>
						) : null}
						{hasPermission(session, "org:fees:create") ? (
							<DropdownMenuItem
								onClick={() => feeOverlay.overlay.create.open()}
							>
								<DollarSignIcon size={16} />
								Honorário
							</DropdownMenuItem>
						) : null}
						{hasPermission(session, "org:employees:create") ? (
							<DropdownMenuItem
								onClick={() => employeeOverlay.overlay.create.open()}
							>
								<UsersIcon size={16} />
								Colaborador
							</DropdownMenuItem>
						) : null}
					</DropdownMenuContent>
				</DropdownMenu>
			}
		>
			<WrapperHeader>
				<DashboardFilter isAdmin={isAdmin} />
			</WrapperHeader>
			<WrapperBody>
				<Dashboard data={summary} />
				{clientOverlay.overlay.create.render((state) => (
					<ClientForm state={state} onSuccess={state.close} />
				))}
				{contractOverlay.overlay.create.render((state) => (
					<ContractForm state={state} onSuccess={state.close} />
				))}
				{feeOverlay.overlay.create.render((state) => (
					<FeeForm state={state} onSuccess={state.close} />
				))}
				{employeeOverlay.overlay.create.render((state) => (
					<EmployeeForm state={state} onSuccess={state.close} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
