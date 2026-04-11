import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { PlusIcon } from "lucide-react";
import {
	type Employee,
	EmployeeDelete,
	EmployeeDetails,
	EmployeeFilter,
	EmployeeForm,
	EmployeeRestore,
	EmployeeTable,
	employeeSearchSchema,
	getEmployeesOptions,
} from "@/features/employees";
import { RouteLoading } from "@/shared/components/route-loading";
import { Button } from "@/shared/components/ui";
import { Wrapper } from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useOverlay } from "@/shared/hooks/use-overlay";

export const Route = createFileRoute("/colaboradores")({
	validateSearch: zodValidator(employeeSearchSchema),
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		await queryClient.ensureQueryData(getEmployeesOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getEmployeesOptions(search));
	const { overlay } = useOverlay<Employee>();

	return (
		<Wrapper
			title={ROUTES.employee.title}
			actions={
				// TODO: show only for Admin role
				<Button size="sm" onPress={() => overlay.create.open()}>
					<PlusIcon size={16} />
					Novo Funcionário
				</Button>
			}
		>
			<Wrapper.Header>
				<EmployeeFilter />
				<RouteLoading />
			</Wrapper.Header>
			<Wrapper.Body>
				<EmployeeTable
					data={data}
					onEdit={overlay.edit.open}
					onView={overlay.details.open}
					onDelete={overlay.delete.open}
					onRestore={overlay.restore.open}
				/>
				{overlay.create.render((state) => (
					<EmployeeForm state={state} onSuccess={state.close} />
				))}
				{overlay.edit.render((employee, state) => (
					<EmployeeForm
						state={state}
						employee={employee}
						onSuccess={state.close}
					/>
				))}
				{overlay.delete.render((employee, state) => (
					<EmployeeDelete
						state={state}
						employee={employee}
						onSuccess={state.close}
					/>
				))}
				{overlay.restore.render((employee, state) => (
					<EmployeeRestore
						state={state}
						employee={employee}
						onSuccess={state.close}
					/>
				))}
				{overlay.details.render((employee, state) => (
					<EmployeeDetails state={state} employee={employee} />
				))}
			</Wrapper.Body>
		</Wrapper>
	);
}
