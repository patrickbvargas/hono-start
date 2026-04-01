import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	EmployeeForm,
	EmployeeTable,
	employeeSearchSchema,
	getEmployeesOptions,
} from "@/features/employees";
import { Pagination } from "@/shared/components/pagination";
import {
	Wrapper,
	WrapperBody,
	WrapperFooter,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";

export const Route = createFileRoute("/funcionarios")({
	validateSearch: zodValidator(employeeSearchSchema),
	loaderDeps: ({ search }) => ({ search }),
	loader: ({ context: { queryClient }, deps: { search } }) => {
		queryClient.ensureQueryData(getEmployeesOptions(search));
	},
	component: RouteComponent,
});

function RouteComponent() {
	// return <EmployeeForm />;
	const search = Route.useSearch();
	const employees = useSuspenseQuery(getEmployeesOptions(search));
	// const _mutationCreate = useMutation(createEmployeeOptions());
	// const _mutationUpdate = useMutation(updateEmployeeOptions());
	// const _mutationDelete = useMutation(deleteEmployeeOptions());

	return (
		<Wrapper title={ROUTES.employee.title}>
			{/* <WrapperHeader className="flex gap-3">
				<Button size="sm" onClick={() => _mutationCreate.mutate({ data: {} })}>
					Create
				</Button>
				<Button
					size="sm"
					variant="secondary"
					onClick={() => _mutationUpdate.mutate({ data: {} })}
				>
					Update
				</Button>
				<Button
					size="sm"
					variant="destructive"
					onClick={() => _mutationDelete.mutate({ data: { id: "1" } })}
				>
					Delete
				</Button>
			</WrapperHeader> */}
			<WrapperBody>
				<EmployeeTable employees={employees.data.items} />
				<EmployeeForm />
			</WrapperBody>
			<WrapperFooter>
				<Pagination totalRecords={employees.data.total} />
			</WrapperFooter>
		</Wrapper>
	);
}
