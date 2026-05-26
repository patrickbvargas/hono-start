import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	ContractDelete,
	ContractDetails,
	ContractFilter,
	ContractForm,
	ContractList,
	ContractRestore,
	ContractTable,
	contractSearchDefaults,
	contractSearchSchema,
	getContractAssignmentTypesQueryOptions,
	getContractLegalAreasQueryOptions,
	getContractRevenueTypesQueryOptions,
	getContractStatusesQueryOptions,
	getContractsQueryOptions,
	getSelectableContractClientsQueryOptions,
	getSelectableContractEmployeesQueryOptions,
	useContracts,
} from "@/features/contracts";
import { ButtonNew } from "@/shared/components/button-new";
import { EntityView } from "@/shared/components/entity-view";
import { RouteError } from "@/shared/components/route-error";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { getPageTitle, ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";

export const Route = createFileRoute("/_app/contratos")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.contract.title) }],
	}),
	validateSearch: zodValidator(contractSearchSchema),
	search: {
		middlewares: [stripSearchParams(contractSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.ensureQueryData(getContractsQueryOptions(search)),
			queryClient.ensureQueryData(getSelectableContractClientsQueryOptions()),
			queryClient.ensureQueryData(getSelectableContractEmployeesQueryOptions()),
			queryClient.ensureQueryData(getContractLegalAreasQueryOptions()),
			queryClient.ensureQueryData(getContractStatusesQueryOptions()),
			queryClient.ensureQueryData(getContractAssignmentTypesQueryOptions()),
			queryClient.ensureQueryData(getContractRevenueTypesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.contract.title} error={error} />
	),
});

function RouteComponent() {
	const search = Route.useSearch();
	const { contracts } = useContracts(search);
	const { overlay } = useOverlay<EntityId>();
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	return (
		<Wrapper
			title={ROUTES.contract.title}
			actions={
				<ButtonNew
					label="Novo contrato"
					onClick={() => overlay.create.open()}
				/>
			}
		>
			<WrapperHeader>
				<ContractFilter />
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					list={
						<ContractList
							data={contracts}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
					table={
						<ContractTable
							data={contracts}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
				/>
				{overlay.create.render((state) => (
					<ContractForm state={state} onSuccess={state.close} />
				))}
				{overlay.edit.render((id, state) => (
					<ContractForm state={state} id={id} onSuccess={state.close} />
				))}
				{overlay.delete.render((id, state) => (
					<ContractDelete id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.restore.render((id, state) => (
					<ContractRestore id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.details.render((id, state) => (
					<ContractDetails
						id={id}
						state={state}
						onEdit={overlay.edit.open}
						onDelete={overlay.delete.open}
						onRestore={overlay.restore.open}
						canManageLifecycle={isAdmin}
					/>
				))}
			</WrapperBody>
		</Wrapper>
	);
}
