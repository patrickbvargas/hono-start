import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import {
	employeeSearchSchema,
	getEmployeesOptions,
} from "@/features/employees";
import { Wrapper, WrapperBody } from "@/shared/components/wrapper";
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
	const search = Route.useSearch();
	const employees = useSuspenseQuery(getEmployeesOptions(search));

	return (
		<Wrapper title={ROUTES.employee.title}>
			<WrapperBody>{JSON.stringify(employees, null, 2)}</WrapperBody>
		</Wrapper>
	);
}
