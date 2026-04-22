import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { PlusIcon } from "lucide-react";
import {
	ClientDelete,
	ClientDetails,
	ClientFilter,
	ClientForm,
	ClientRestore,
	ClientTable,
	clientSearchSchema,
	getClientsQueryOptions,
} from "@/features/clients";
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
import {
	getLoggedUserSession,
	isAdminSession,
	useLoggedUserSessionStore,
} from "@/shared/session";

export const Route = createFileRoute("/clientes")({
	validateSearch: zodValidator(clientSearchSchema),
	beforeLoad: () => {
		getLoggedUserSession();
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getClientsQueryOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getClientsQueryOptions(search));
	const { overlay } = useOverlay<EntityId>();
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	return (
		<Wrapper
			title={ROUTES.client.title}
			actions={
				<Button size="sm" onClick={() => overlay.create.open()}>
					<PlusIcon size={16} />
					Novo Cliente
				</Button>
			}
		>
			<WrapperHeader>
				<ClientFilter />
				<RouteLoading />
			</WrapperHeader>
			<WrapperBody>
				<ClientTable
					data={data}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
					canManageLifecycle={isAdmin}
				/>
				{overlay.create.render((state) => (
					<ClientForm state={state} onSuccess={state.close} />
				))}
				{overlay.edit.render((id, state) => (
					<ClientForm state={state} id={id} onSuccess={state.close} />
				))}
				{overlay.delete.render((id, state) => (
					<ClientDelete id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.restore.render((id, state) => (
					<ClientRestore id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.details.render((id, state) => (
					<ClientDetails id={id} state={state} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
