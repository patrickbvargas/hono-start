import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
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
	getEmployeeRolesQueryOptions,
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
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";

export const Route = createFileRoute("/_app/")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.dashboard.title) }],
	}),
	validateSearch: zodValidator(dashboardSearchSchema),
	search: {
		middlewares: [stripSearchParams(dashboardSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient, session }, deps: { search } }) => {
		const prefetches = [
			queryClient.ensureQueryData(getDashboardSummaryQueryOptions(search)),
			queryClient.ensureQueryData(getDashboardEmployeeOptionsQueryOptions()),
			queryClient.ensureQueryData(getClientTypesQueryOptions()),
			queryClient.ensureQueryData(getSelectableContractClientsQueryOptions()),
			queryClient.ensureQueryData(getSelectableContractEmployeesQueryOptions()),
			queryClient.ensureQueryData(getContractLegalAreasQueryOptions()),
			queryClient.ensureQueryData(getContractStatusesQueryOptions()),
			queryClient.ensureQueryData(getContractAssignmentTypesQueryOptions()),
			queryClient.ensureQueryData(getContractRevenueTypesQueryOptions()),
			queryClient.ensureQueryData(getSelectableFeeContractsQueryOptions()),
			queryClient.ensureQueryData(getSelectableFeeRevenuesQueryOptions()),
		];

		if (isAdminSession(session)) {
			prefetches.push(
				queryClient.ensureQueryData(getEmployeeTypesQueryOptions()),
				queryClient.ensureQueryData(getEmployeeRolesQueryOptions()),
			);
		}

		await Promise.all(prefetches);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => <RouteError title="Dashboard" error={error} />,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { summary } = useDashboardData(search);
	const isAdmin = useLoggedUserSessionStore(isAdminSession);
	const clientOverlay = useOverlay<EntityId>();
	const contractOverlay = useOverlay<EntityId>();
	const feeOverlay = useOverlay<EntityId>();
	const employeeOverlay = useOverlay<EntityId>();

	return (
		<Wrapper
			title={ROUTES.dashboard.title}
			actions={
				<DropdownMenu>
					<DropdownMenuTrigger render={<Button size="sm" />}>
						<PlusIcon size={16} />
						Novo
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => clientOverlay.overlay.create.open()}
						>
							<UserIcon size={16} />
							Cliente
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => contractOverlay.overlay.create.open()}
						>
							<BriefcaseIcon size={16} />
							Contrato
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => feeOverlay.overlay.create.open()}>
							<DollarSignIcon size={16} />
							Honorário
						</DropdownMenuItem>
						{isAdmin ? (
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
