import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { PlusIcon } from "lucide-react";
import {
	ContractDelete,
	ContractDetails,
	ContractFilter,
	ContractForm,
	ContractRestore,
	ContractTable,
	contractSearchDefaults,
	contractSearchSchema,
	getContractsQueryOptions,
	useContracts,
} from "@/features/contracts";
import { ListRouteSkeleton } from "@/shared/components/list-route-skeleton";
import { RouteLoading } from "@/shared/components/route-loading";
import { Button } from "@/shared/components/ui";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";

export const Route = createFileRoute("/_app/contratos")({
	validateSearch: zodValidator(contractSearchSchema),
	search: {
		middlewares: [stripSearchParams(contractSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getContractsQueryOptions(search));
	},
	pendingMs: 0,
	pendingComponent: () => (
		<ListRouteSkeleton title={ROUTES.contract.title} showActions />
	),
	component: RouteComponent,
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
				<Button size="sm" onClick={() => overlay.create.open()}>
					<PlusIcon size={16} />
					Novo Contrato
				</Button>
			}
		>
			<WrapperHeader>
				<ContractFilter />
				<RouteLoading />
			</WrapperHeader>
			<WrapperBody>
				<ContractTable
					data={contracts}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
					canManageLifecycle={isAdmin}
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
					<ContractDetails id={id} state={state} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
