import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	ClientDelete,
	ClientDetails,
	ClientFilter,
	ClientForm,
	ClientList,
	ClientRestore,
	ClientTable,
	clientSearchDefaults,
	clientSearchSchema,
	getClientsQueryOptions,
	getClientTypesQueryOptions,
	useClients,
} from "@/features/clients";
import { ButtonNew } from "@/shared/components/button-new";
import { EntityView } from "@/shared/components/entity-view";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { getPageTitle, ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";

export const Route = createFileRoute("/_app/clientes")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.client.title) }],
	}),
	validateSearch: zodValidator(clientSearchSchema),
	search: {
		middlewares: [stripSearchParams(clientSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.ensureQueryData(getClientsQueryOptions(search)),
			queryClient.ensureQueryData(getClientTypesQueryOptions()),
		]);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { clients } = useClients(search);
	const { overlay } = useOverlay<EntityId>();
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	return (
		<Wrapper
			title={ROUTES.client.title}
			actions={
				<ButtonNew label="Novo cliente" onClick={() => overlay.create.open()} />
			}
		>
			<WrapperHeader>
				<ClientFilter />
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					className="min-h-0 flex-1"
					list={
						<ClientList
							data={clients}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
					table={
						<ClientTable
							data={clients}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
				/>
				{overlay.details.render((id, state) => (
					<ClientDetails
						id={id}
						state={state}
						onEdit={overlay.edit.open}
						onDelete={overlay.delete.open}
						onRestore={overlay.restore.open}
						canManageLifecycle={isAdmin}
					/>
				))}
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
			</WrapperBody>
		</Wrapper>
	);
}
