import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { PlusIcon } from "lucide-react";
import {
	type Contract,
	ContractDelete,
	ContractDetails,
	ContractFilter,
	ContractForm,
	ContractRestore,
	ContractTable,
	contractSearchSchema,
	getContractsOptions,
} from "@/features/contracts";
import { RouteLoading } from "@/shared/components/route-loading";
import { Button } from "@/shared/components/ui";
import { Wrapper } from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import {
	getLoggedUserSession,
	isAdminSession,
	useLoggedUserSessionStore,
} from "@/shared/session";

export const Route = createFileRoute("/contratos")({
	validateSearch: zodValidator(contractSearchSchema),
	beforeLoad: () => {
		getLoggedUserSession();
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getContractsOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getContractsOptions(search));
	const { overlay } = useOverlay<Contract>();
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	return (
		<Wrapper
			title={ROUTES.contract.title}
			actions={
				<Button size="sm" onPress={() => overlay.create.open()}>
					<PlusIcon size={16} />
					Novo Contrato
				</Button>
			}
		>
			<Wrapper.Header>
				<ContractFilter />
				<RouteLoading />
			</Wrapper.Header>
			<Wrapper.Body>
				<ContractTable
					canManageLifecycle={isAdmin}
					data={data}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
				/>
				{overlay.create.render((state) => (
					<ContractForm state={state} onSuccess={state.close} />
				))}
				{overlay.edit.render((contract, state) => (
					<ContractForm
						state={state}
						contract={contract}
						onSuccess={state.close}
					/>
				))}
				{overlay.delete.render((contract, state) => (
					<ContractDelete
						contract={contract}
						state={state}
						onSuccess={state.close}
					/>
				))}
				{overlay.restore.render((contract, state) => (
					<ContractRestore
						contract={contract}
						state={state}
						onSuccess={state.close}
					/>
				))}
				{overlay.details.render((contract, state) => (
					<ContractDetails contract={contract} state={state} />
				))}
			</Wrapper.Body>
		</Wrapper>
	);
}
