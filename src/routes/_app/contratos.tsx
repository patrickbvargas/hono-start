import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
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
import { useEntityOverlay } from "@/shared/hooks/use-entity-overlay";
import { entityDetailSearchSchema } from "@/shared/schemas/entity-detail-search";
import { hasPermission, useLoggedUserSession } from "@/shared/session";

export const Route = createFileRoute("/_app/contratos")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.contract.title) }],
	}),
	validateSearch: contractSearchSchema.extend(entityDetailSearchSchema.shape),
	search: {
		middlewares: [stripSearchParams(contractSearchDefaults)],
	},
	loaderDeps: ({ search: { detailId: _detailId, ...search } }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.query(getContractsQueryOptions(search)),
			queryClient.query(getSelectableContractClientsQueryOptions()),
			queryClient.query(getSelectableContractEmployeesQueryOptions()),
			queryClient.query(getContractLegalAreasQueryOptions()),
			queryClient.query(getContractStatusesQueryOptions()),
			queryClient.query(getContractAssignmentTypesQueryOptions()),
			queryClient.query(getContractRevenueTypesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.contract.title} error={error} />
	),
});

function RouteComponent() {
	const { detailId, ...search } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { contracts } = useContracts(search);
	const openContractPage = (id: number) => {
		void navigate({
			to: "/contratos/$contractId",
			params: { contractId: String(id) },
			search: { tab: "overview", returnTo: search },
		});
	};
	const { overlay } = useEntityOverlay(detailId, (id) => {
		void navigate({
			search: (previous) => ({ ...previous, detailId: id }),
			replace: id === undefined,
		});
	});
	const session = useLoggedUserSession();
	const isAdmin =
		hasPermission(session, "org:contracts:delete") ||
		hasPermission(session, "org:contracts:restore");

	return (
		<Wrapper
			title={ROUTES.contract.title}
			actions={
				<ButtonNew
					permission="org:contracts:create"
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
							onOpenPage={openContractPage}
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
							onOpenPage={openContractPage}
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
