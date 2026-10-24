import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	getRemunerationsQueryOptions,
	getSelectableRemunerationContractsQueryOptions,
	getSelectableRemunerationEmployeesQueryOptions,
	RemunerationDelete,
	RemunerationDetails,
	RemunerationExportMenu,
	RemunerationFilter,
	RemunerationForm,
	RemunerationList,
	RemunerationRestore,
	RemunerationTable,
	remunerationSearchDefaults,
	remunerationSearchSchema,
	useRemunerationExport,
	useRemunerations,
} from "@/features/remunerations";
import { EntityView } from "@/shared/components/entity-view";
import { RouteError } from "@/shared/components/route-error";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { getPageTitle, ROUTES } from "@/shared/config/routes";
import { useEntityOverlay } from "@/shared/hooks/use-entity-overlay";
import { formatter } from "@/shared/lib/formatter";
import { entityDetailSearchSchema } from "@/shared/schemas/entity-detail-search";
import { hasPermission, useLoggedUserSession } from "@/shared/session";

export const Route = createFileRoute("/_app/remuneracoes")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.remuneration.title) }],
	}),
	validateSearch: remunerationSearchSchema.extend(
		entityDetailSearchSchema.shape,
	),
	search: {
		middlewares: [stripSearchParams(remunerationSearchDefaults)],
	},
	loaderDeps: ({ search: { detailId: _detailId, ...search } }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.query(getRemunerationsQueryOptions(search)),
			queryClient.query(getSelectableRemunerationContractsQueryOptions()),
			queryClient.query(getSelectableRemunerationEmployeesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.remuneration.title} error={error} />
	),
});

function RouteComponent() {
	const { detailId, ...search } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { remunerations } = useRemunerations(search);
	const { overlay } = useEntityOverlay(detailId, (id) => {
		void navigate({
			search: (previous) => ({ ...previous, detailId: id }),
			replace: id === undefined,
		});
	});
	const session = useLoggedUserSession();
	const isAdmin =
		hasPermission(session, "org:remunerations:delete") ||
		hasPermission(session, "org:remunerations:restore");
	const canReadAll = hasPermission(session, "org:remunerations:read_all");
	const canExport = (
		["org:remunerations:export_all", "org:remunerations:export_own"] as const
	).some((permission) => hasPermission(session, permission));
	const { handleExport, isPending, pendingFormat } =
		useRemunerationExport(search);

	return (
		<Wrapper
			title={ROUTES.remuneration.title}
			actions={
				canExport ? (
					<RemunerationExportMenu
						onExport={handleExport}
						isPending={isPending}
						pendingFormat={pendingFormat}
					/>
				) : null
			}
		>
			<WrapperHeader className="flex-wrap md:flex-nowrap">
				<RemunerationFilter
					isAdmin={canReadAll}
					summary={
						<p className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
							Total filtrado:{" "}
							<strong className="font-semibold tabular-nums text-foreground">
								{formatter.currency(remunerations.totalAmount)}
							</strong>
						</p>
					}
				/>
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					list={
						<RemunerationList
							data={remunerations}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
					table={
						<RemunerationTable
							data={remunerations}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
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
					<RemunerationDetails
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
