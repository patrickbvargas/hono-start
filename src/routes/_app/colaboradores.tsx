import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
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
	getEmployeeRolesQueryOptions,
	getEmployeesQueryOptions,
	getEmployeeTypesQueryOptions,
	useEmployees,
} from "@/features/employees";
import { ButtonNew } from "@/shared/components/button-new";
import { EntityView } from "@/shared/components/entity-view";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";
import { getPageTitle, ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";
import type { EntityId } from "@/shared/schemas/entity";
import { assertCan, can, useLoggedUserSessionStore } from "@/shared/session";

export const Route = createFileRoute("/_app/colaboradores")({
	head: () => ({
		meta: [{ title: getPageTitle(ROUTES.employee.title) }],
	}),
	validateSearch: zodValidator(employeeSearchSchema),
	search: {
		middlewares: [stripSearchParams(employeeSearchDefaults)],
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient, session }, deps: { search } }) => {
		assertCan(session, "employee.manage");
		await Promise.all([
			queryClient.ensureQueryData(getEmployeesQueryOptions(search)),
			queryClient.ensureQueryData(getEmployeeTypesQueryOptions()),
			queryClient.ensureQueryData(getEmployeeRolesQueryOptions()),
		]);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { employees } = useEmployees(search);
	const { overlay } = useOverlay<EntityId>();
	const canManage = useLoggedUserSessionStore((session) =>
		can(session, "employee.manage"),
	);

	return (
		<Wrapper
			title={ROUTES.employee.title}
			actions={
				canManage && (
					<ButtonNew
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
