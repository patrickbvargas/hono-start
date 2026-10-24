import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import {
	EmployeeDelete,
	EmployeeDetails,
	EmployeeFilter,
	EmployeeForm,
	EmployeeList,
	EmployeeRestore,
	EmployeeTable,
	employeeSearchDefaults,
	employeeSearchSchema,
	getEmployeesQueryOptions,
	getEmployeeTypesQueryOptions,
	useEmployees,
} from "@/features/employees";
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
import {
	assertCan,
	hasPermission,
	useLoggedUserSession,
} from "@/shared/session";

export const Route = createFileRoute("/_app/colaboradores")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.employee.title) }],
	}),
	validateSearch: employeeSearchSchema.extend(entityDetailSearchSchema.shape),
	search: {
		middlewares: [stripSearchParams(employeeSearchDefaults)],
	},
	loaderDeps: ({ search: { detailId: _detailId, ...search } }) => ({ search }),
	loader: async ({ context: { queryClient, session }, deps: { search } }) => {
		assertCan(session, "org:employees:read");
		await Promise.all([
			queryClient.query(getEmployeesQueryOptions(search)),
			queryClient.query(getEmployeeTypesQueryOptions()),
		]);
	},
	component: RouteComponent,
	errorComponent: ({ error }) => (
		<RouteError title={ROUTES.employee.title} error={error} />
	),
});

function RouteComponent() {
	const { detailId, ...search } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { employees } = useEmployees(search);
	const { overlay } = useEntityOverlay(detailId, (id) => {
		void navigate({
			search: (previous) => ({ ...previous, detailId: id }),
			replace: id === undefined,
		});
	});
	const session = useLoggedUserSession();
	const canManage = hasPermission(session, "org:employees:read");

	return (
		<Wrapper
			title={ROUTES.employee.title}
			actions={
				canManage && (
					<ButtonNew
						permission="org:employees:create"
						label="Novo colaborador"
						onClick={() => overlay.create.open()}
					/>
				)
			}
		>
			<WrapperHeader>
				<EmployeeFilter />
			</WrapperHeader>
			<WrapperBody>
				<EntityView
					list={
						<EmployeeList
							data={employees}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={canManage}
						/>
					}
					table={
						<EmployeeTable
							data={employees}
							onEdit={overlay.edit.open}
							onView={overlay.details.open}
							onDelete={overlay.delete.open}
							onRestore={overlay.restore.open}
							canManageLifecycle={canManage}
						/>
					}
				/>
				{overlay.create.render((state) => (
					<EmployeeForm state={state} onSuccess={state.close} />
				))}
				{overlay.edit.render((id, state) => (
					<EmployeeForm state={state} id={id} onSuccess={state.close} />
				))}
				{overlay.delete.render((id, state) => (
					<EmployeeDelete id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.restore.render((id, state) => (
					<EmployeeRestore id={id} state={state} onSuccess={state.close} />
				))}
				{overlay.details.render((id, state) => (
					<EmployeeDetails
						id={id}
						state={state}
						onEdit={overlay.edit.open}
						onDelete={overlay.delete.open}
						onRestore={overlay.restore.open}
						canManageLifecycle={canManage}
					/>
				))}
			</WrapperBody>
		</Wrapper>
	);
}
