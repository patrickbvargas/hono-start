import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { employeesQueryOptions } from "@/features/employees/api/get-employees";
import { EmployeeTable } from "@/features/employees/components/table";
import { employeeSearchSchema } from "@/features/employees/schemas/search";
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
    queryClient.ensureQueryData(employeesQueryOptions(search));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(employeesQueryOptions(search));

  return (
    <Wrapper title={ROUTES.employee.title}>
      <WrapperBody>
        <pre>{JSON.stringify(search)}</pre>
        <EmployeeTable employees={data.items} />
      </WrapperBody>
      <WrapperFooter>
        <Pagination totalRecords={data.total} />
      </WrapperFooter>
    </Wrapper>
  );
}
