import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	FeeDelete,
	FeeDetails,
	FeeFilter,
	FeeForm,
	FeeRestore,
	FeeTable,
	feeSearchDefaults,
	feeSearchSchema,
	getFeesQueryOptions,
	getSelectableFeeContractsQueryOptions,
	getSelectableFeeRevenuesQueryOptions,
	useFees,
} from "@/features/fees";
import { ButtonNew } from "@/shared/components/button-new";
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
	search: {
		middlewares: [stripSearchParams(feeSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.ensureQueryData(getFeesQueryOptions(search)),
			queryClient.ensureQueryData(getSelectableFeeContractsQueryOptions()),
			queryClient.ensureQueryData(getSelectableFeeRevenuesQueryOptions()),
		]);
	},
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
			actions={<ButtonNew onClick={() => overlay.create.open()} />}
		>
			<WrapperHeader>
				<FeeFilter />
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
					<FeeDetails
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
