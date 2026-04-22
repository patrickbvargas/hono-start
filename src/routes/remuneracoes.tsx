import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	getRemunerationsQueryOptions,
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
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
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
		await queryClient.ensureQueryData(getRemunerationsQueryOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getRemunerationsQueryOptions(search));
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
			<WrapperHeader>
				<RemunerationFilter isAdmin={isAdmin} />
				<RouteLoading />
			</WrapperHeader>
			<WrapperBody>
				<RemunerationTable
					data={data}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
					canManageLifecycle={isAdmin}
				/>
				{overlay.edit.render((remuneration, state) => (
					<RemunerationForm
						id={remuneration.id}
						state={state}
						onSuccess={state.close}
					/>
				))}
				{overlay.delete.render((remuneration, state) => (
					<RemunerationDelete
						id={remuneration.id}
						state={state}
						onSuccess={state.close}
					/>
				))}
				{overlay.restore.render((remuneration, state) => (
					<RemunerationRestore
						id={remuneration.id}
						state={state}
						onSuccess={state.close}
					/>
				))}
				{overlay.details.render((remuneration, state) => (
					<RemunerationDetails remuneration={remuneration} state={state} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
