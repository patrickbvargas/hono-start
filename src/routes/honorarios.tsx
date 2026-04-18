import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { PlusIcon } from "lucide-react";
import {
	FeeDelete,
	FeeDetails,
	FeeFilter,
	FeeForm,
	FeeRestore,
	FeeTable,
	feeSearchSchema,
	getFeesQueryOptions,
} from "@/features/fees";
import { RouteLoading } from "@/shared/components/route-loading";
import { Button } from "@/shared/components/ui";
import { Wrapper } from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import {
	getLoggedUserSession,
	isAdminSession,
	useLoggedUserSessionStore,
} from "@/shared/session";

export const Route = createFileRoute("/honorarios")({
	validateSearch: zodValidator(feeSearchSchema),
	beforeLoad: () => {
		getLoggedUserSession();
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getFeesQueryOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getFeesQueryOptions(search));
	const { overlay } = useOverlay<EntityId>();
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	return (
		<Wrapper
			title={ROUTES.fee.title}
			actions={
				<Button size="sm" onPress={() => overlay.create.open()}>
					<PlusIcon size={16} />
					Novo Honorário
				</Button>
			}
		>
			<Wrapper.Header>
				<FeeFilter />
				<RouteLoading />
			</Wrapper.Header>
			<Wrapper.Body>
				<FeeTable
					canManageLifecycle={isAdmin}
					data={data}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
				/>
				{overlay.create.render((state) => (
					<FeeForm state={state} onSuccess={state.close} />
				))}
				{overlay.edit.render((id, state) => (
					<FeeForm id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.delete.render((id, state) => (
					<FeeDelete id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.restore.render((id, state) => (
					<FeeRestore id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.details.render((id, state) => (
					<FeeDetails id={id} state={state} />
				))}
			</Wrapper.Body>
		</Wrapper>
	);
}
