import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { PlusIcon } from "lucide-react";
import {
	EmployeeDelete,
	EmployeeDetails,
	EmployeeFilter,
	EmployeeForm,
	EmployeeRestore,
	EmployeeTable,
	employeeSearchSchema,
	getEmployeesQueryOptions,
	useEmployees,
} from "@/features/employees";
import { AuthenticatedShell } from "@/shared/components/authenticated-shell";
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
import {
	assertCan,
	can,
	requireRouteSession,
	useLoggedUserSessionStore,
} from "@/shared/session";

export const Route = createFileRoute("/colaboradores")({
	validateSearch: zodValidator(employeeSearchSchema),
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		const session = await requireRouteSession(queryClient);
		assertCan(session, "employee.manage");
		await queryClient.ensureQueryData(getEmployeesQueryOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<AuthenticatedShell>
			<ColaboradoresContent />
		</AuthenticatedShell>
	);
}

function ColaboradoresContent() {
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
				canManage ? (
					<Button size="sm" onClick={() => overlay.create.open()}>
						<PlusIcon size={16} />
						Novo Funcionário
					</Button>
				) : null
			}
		>
			<WrapperHeader>
				<EmployeeFilter />
				<RouteLoading />
			</WrapperHeader>
			<WrapperBody>
				<EmployeeTable
					data={employees}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
					canManageLifecycle={canManage}
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
					<EmployeeDetails id={id} state={state} />
				))}
			</WrapperBody>
		</Wrapper>
	);
}
