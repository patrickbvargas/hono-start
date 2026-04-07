import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { PlusIcon } from "lucide-react";
import {
	type Employee,
	EmployeeDelete,
	EmployeeDetails,
	EmployeeForm,
	EmployeeRestore,
	EmployeeTable,
	employeeSearchSchema,
	getEmployeesOptions,
} from "@/features/employees";
import { Button } from "@/shared/components/ui";
import { Wrapper, WrapperBody } from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useModals } from "@/shared/hooks/use-modals";

export const Route = createFileRoute("/colaboradores")({
	validateSearch: zodValidator(employeeSearchSchema),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context: { queryClient }, deps: { search } }) => {
		queryClient.ensureQueryData(getEmployeesOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const { data } = useSuspenseQuery(getEmployeesOptions(search));
	const { selected, open, close, stateOf } = useModals<Employee>();

	return (
		<Wrapper
			title={ROUTES.employee.title}
			actions={
				// TODO: show only for Admin role
				<Button size="sm" onPress={() => open("form")}>
					<PlusIcon size={16} />
					Novo Funcionário
				</Button>
			}
		>
			<WrapperBody>
				<EmployeeTable
					data={data}
					onView={(row) => open("details", row)}
					onEdit={(row) => open("form", row)}
					onDelete={(row) => open("delete", row)}
					onRestore={(row) => open("restore", row)}
				/>
				<EmployeeForm
					employee={selected}
					onSuccess={() => close("form")}
					state={stateOf("form")}
				/>
				<EmployeeDelete
					employee={selected}
					onSuccess={() => close("delete")}
					state={stateOf("delete")}
				/>
				<EmployeeRestore
					employee={selected}
					onSuccess={() => close("restore")}
					state={stateOf("restore")}
				/>
				<EmployeeDetails
					employee={selected}
					onSuccess={() => close("details")}
					state={stateOf("details")}
				/>
			</WrapperBody>
		</Wrapper>
	);
}
