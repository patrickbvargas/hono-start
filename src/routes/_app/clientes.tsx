import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_app/clientes")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.client.title) }],
	}),
	validateSearch: clientSearchSchema.extend(entityDetailSearchSchema.shape),
	search: {
		middlewares: [stripSearchParams(clientSearchDefaults)],
	},
	loaderDeps: ({ search: { detailId: _detailId, ...search } }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.query(getClientsQueryOptions(search)),
			queryClient.query(getClientTypesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.client.title} error={error} />
	),
});

function RouteComponent() {
	const { detailId, ...search } = Route.useSearch();
	const navigate = Route.useNavigate();
	const openClientPage = (id: number) => {
		void navigate({
			to: "/clientes/$clientId",
			params: { clientId: String(id) },
			search: { tab: "overview", returnTo: search },
		});
	};
	const { clients } = useClients(search);
	const { overlay } = useEntityOverlay(detailId, (id) => {
		void navigate({
			search: (previous) => ({ ...previous, detailId: id }),
			replace: id === undefined,
		});
	});
	const session = useLoggedUserSession();
	const isAdmin =
		hasPermission(session, "org:clients:delete") ||
		hasPermission(session, "org:clients:restore");

	return (
		<Wrapper
			title={ROUTES.client.title}
			actions={
				<ButtonNew
					permission="org:clients:create"
					label="Novo cliente"
					onClick={() => overlay.create.open()}
				/>
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
							onOpenPage={openClientPage}
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
							onOpenPage={openClientPage}
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
