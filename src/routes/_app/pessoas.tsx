import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	getEmployeeTypesQueryOptions,
	getPeopleQueryOptions,
	getPersonTypesQueryOptions,
	PersonDelete,
	PersonDetails,
	PersonFilter,
	PersonForm,
	PersonList,
	PersonRestore,
	PersonTable,
	personSearchDefaults,
	personSearchSchema,
	usePeople,
	usePersonFilter,
} from "@/features/people";
import { ButtonNew } from "@/shared/components/button-new";
import { EntityView } from "@/shared/components/entity-view";
import { RouteError } from "@/shared/components/route-error";
import { ListEmptyState } from "@/shared/components/ui";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useEntityOverlay } from "@/shared/hooks/use-entity-overlay";
import { entityDetailSearchSchema } from "@/shared/schemas/entity-detail-search";
import { hasPermission, useLoggedUserSession } from "@/shared/session";

export const Route = createFileRoute("/_app/pessoas")({
	staticData: { pageTitle: ROUTES.person.title },
	validateSearch: personSearchSchema.extend(entityDetailSearchSchema.shape),
	search: {
		middlewares: [stripSearchParams(personSearchDefaults)],
	},
	loaderDeps: ({ search: { detailId: _detailId, ...search } }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await Promise.all([
			queryClient.query(getPeopleQueryOptions(search)),
			queryClient.query(getPersonTypesQueryOptions()),
			queryClient.query(getEmployeeTypesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.person.title} error={error} />
	),
});

function RouteComponent() {
	const filterController = usePersonFilter();
	const { detailId, ...search } = Route.useSearch();
	const navigate = Route.useNavigate();
	const openPersonPage = (id: number) => {
		void navigate({
			to: "/pessoas/$personId",
			params: { personId: String(id) },
			search: { tab: "overview", returnTo: search },
		});
	};
	const { people } = usePeople(search);
	const { overlay } = useEntityOverlay(detailId, (id) => {
		void navigate({
			search: (previous) => ({ ...previous, detailId: id }),
			replace: id === undefined,
		});
	});
	const session = useLoggedUserSession();
	const isAdmin =
		hasPermission(session, "org:people:delete") ||
		hasPermission(session, "org:people:restore");

	const emptyState = (
		<ListEmptyState
			title="Nenhuma pessoa disponível"
			description="Os pessoas disponíveis para consulta aparecerão aqui."
			hasFilters={filterController.canClearFilters}
			onClearFilters={filterController.handleClearFilters}
			hasRecords={people.total > 0}
			onFirstPage={() =>
				void navigate({ search: (previous) => ({ ...previous, page: 1 }) })
			}
			createAction={
				hasPermission(session, "org:people:create") ? (
					<ButtonNew
						permission="org:people:create"
						label="Nova pessoa"
						onClick={() => overlay.create.open()}
					/>
				) : null
			}
		/>
	);

	return (
		<Wrapper
			title={ROUTES.person.title}
			actions={
				<ButtonNew
					permission="org:people:create"
					label="Nova pessoa"
					onClick={() => overlay.create.open()}
				/>
			}
		>
			<WrapperHeader>
				<PersonFilter controller={filterController} />
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					className="min-h-0 flex-1"
					list={
						<PersonList
							emptyState={emptyState}
							onOpenPage={openPersonPage}
							data={people}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
					table={
						<PersonTable
							emptyState={emptyState}
							onOpenPage={openPersonPage}
							data={people}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={isAdmin}
						/>
					}
				/>
				{overlay.details.render((id, state) => (
					<PersonDetails
						id={id}
						state={state}
						onEdit={overlay.edit.open}
						onDelete={overlay.delete.open}
						onRestore={overlay.restore.open}
						canManageLifecycle={isAdmin}
					/>
				))}
				{overlay.create.render((state) => (
					<PersonForm state={state} onSuccess={state.close} />
				))}
				{overlay.edit.render((id, state) => (
					<PersonForm state={state} id={id} onSuccess={state.close} />
				))}
				{overlay.delete.render((id, state) => (
					<PersonDelete id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.restore.render((id, state) => (
					<PersonRestore id={id} state={state} onSuccess={state.close} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
