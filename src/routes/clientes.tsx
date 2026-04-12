import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { PlusIcon } from "lucide-react";
import {
	type Client,
	ClientDelete,
	ClientDetails,
	ClientFilter,
	ClientForm,
	ClientRestore,
	ClientTable,
	clientSearchSchema,
	getClientsOptions,
} from "@/features/clients";
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

export const Route = createFileRoute("/clientes")({
	validateSearch: zodValidator(clientSearchSchema),
	beforeLoad: () => {
		getLoggedUserSession();
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getClientsOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getClientsOptions(search));
	const { overlay } = useOverlay<Client>();
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	return (
		<Wrapper
			title={ROUTES.client.title}
			actions={
				<Button size="sm" onPress={() => overlay.create.open()}>
					<PlusIcon size={16} />
					Novo Cliente
				</Button>
			}
		>
			<Wrapper.Header>
				<ClientFilter />
				<RouteLoading />
			</Wrapper.Header>
			<Wrapper.Body>
				<ClientTable
					canManageLifecycle={isAdmin}
					data={data}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
				/>
				{overlay.create.render((state) => (
					<ClientForm state={state} onSuccess={state.close} />
				))}
				{overlay.edit.render((client, state) => (
					<ClientForm state={state} client={client} onSuccess={state.close} />
				))}
				{overlay.delete.render((client, state) => (
					<ClientDelete client={client} state={state} onSuccess={state.close} />
				))}
				{overlay.restore.render((client, state) => (
					<ClientRestore
						client={client}
						state={state}
						onSuccess={state.close}
					/>
				))}
				{overlay.details.render((client, state) => (
					<ClientDetails client={client} state={state} />
				))}
			</Wrapper.Body>
		</Wrapper>
	);
}
