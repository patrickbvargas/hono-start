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
	useFees,
} from "@/features/fees";
import { RouteError } from "@/shared/components/route-error";
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

export const Route = createFileRoute("/_app/honorarios")({
	validateSearch: zodValidator(feeSearchSchema),
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getFeesQueryOptions(search));
	},
	errorComponent: ({ error }) => <RouteError error={error} />,
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { fees } = useFees(search);
	const { overlay } = useOverlay<EntityId>();
	const isAdmin = useLoggedUserSessionStore(isAdminSession);

	return (
		<Wrapper
			title={ROUTES.fee.title}
			actions={
				<Button size="sm" onClick={() => overlay.create.open()}>
					<PlusIcon size={16} />
					Novo Honorário
				</Button>
			}
		>
			<WrapperHeader>
				<FeeFilter />
				<RouteLoading />
			</WrapperHeader>
			<WrapperBody>
				<FeeTable
					data={fees}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
					canManageLifecycle={isAdmin}
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
			</WrapperBody>
		</Wrapper>
	);
}
