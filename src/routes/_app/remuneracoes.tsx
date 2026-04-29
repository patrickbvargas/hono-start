import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	getRemunerationsQueryOptions,
	RemunerationDelete,
	RemunerationDetails,
	RemunerationExportMenu,
	RemunerationFilter,
	RemunerationForm,
	RemunerationRestore,
	RemunerationTable,
	remunerationSearchSchema,
	useRemunerationExport,
	useRemunerations,
} from "@/features/remunerations";
import { RouteError } from "@/shared/components/route-error";
import { RouteLoading } from "@/shared/components/route-loading";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";

export const Route = createFileRoute("/_app/remuneracoes")({
	validateSearch: zodValidator(remunerationSearchSchema),
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getRemunerationsQueryOptions(search));
	},
	errorComponent: ({ error }) => <RouteError error={error} />,
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { remunerations } = useRemunerations(search);
	const { overlay } = useOverlay<EntityId>();
	const isAdmin = useLoggedUserSessionStore(isAdminSession);
	const { handleExport, isPending, pendingFormat } =
		useRemunerationExport(search);

	return (
		<Wrapper
			title={ROUTES.remuneration.title}
			actions={
				<RemunerationExportMenu
					onExport={handleExport}
					isPending={isPending}
					pendingFormat={pendingFormat}
				/>
			}
		>
			<WrapperHeader>
				<RemunerationFilter isAdmin={isAdmin} />
				<RouteLoading />
			</WrapperHeader>
			<WrapperBody>
				<RemunerationTable
					data={remunerations}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
					canManageLifecycle={isAdmin}
				/>
				{overlay.edit.render((id, state) => (
					<RemunerationForm id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.delete.render((id, state) => (
					<RemunerationDelete id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.restore.render((id, state) => (
					<RemunerationRestore id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.details.render((id, state) => (
					<RemunerationDetails id={id} state={state} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
