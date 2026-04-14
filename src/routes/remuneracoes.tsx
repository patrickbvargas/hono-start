import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	getRemunerationsOptions,
	type Remuneration,
	RemunerationDelete,
	RemunerationDetails,
	RemunerationExportMenu,
	RemunerationFilter,
	RemunerationForm,
	RemunerationRestore,
	RemunerationTable,
	remunerationSearchSchema,
	useRemunerationExport,
} from "@/features/remunerations";
import { RouteLoading } from "@/shared/components/route-loading";
import { Wrapper } from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import {
	getLoggedUserSession,
	isAdminSession,
	useLoggedUserSessionStore,
} from "@/shared/session";

export const Route = createFileRoute("/remuneracoes")({
	validateSearch: zodValidator(remunerationSearchSchema),
	beforeLoad: () => {
		getLoggedUserSession();
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getRemunerationsOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getRemunerationsOptions(search));
	const { overlay } = useOverlay<Remuneration>();
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
			<Wrapper.Header>
				<RemunerationFilter isAdmin={isAdmin} />
				<RouteLoading />
			</Wrapper.Header>
			<Wrapper.Body>
				<RemunerationTable
					canManageLifecycle={isAdmin}
					data={data}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
				/>
				{overlay.edit.render((remuneration, state) => (
					<RemunerationForm
						remuneration={remuneration}
						state={state}
						onSuccess={state.close}
					/>
				))}
				{overlay.delete.render((remuneration, state) => (
					<RemunerationDelete
						remuneration={remuneration}
						state={state}
						onSuccess={state.close}
					/>
				))}
				{overlay.restore.render((remuneration, state) => (
					<RemunerationRestore
						remuneration={remuneration}
						state={state}
						onSuccess={state.close}
					/>
				))}
				{overlay.details.render((remuneration, state) => (
					<RemunerationDetails remuneration={remuneration} state={state} />
				))}
			</Wrapper.Body>
		</Wrapper>
	);
}
