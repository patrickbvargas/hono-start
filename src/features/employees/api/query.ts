import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { Employee } from "../schemas/model";
import { type EmployeeSearch, employeeSearchSchema } from "../schemas/search";
import { mockData } from "./data";

export const getEmployees = createServerFn()
	.inputValidator(employeeSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<Employee>> => {
		// 1. Filtragem
		const filteredData = mockData.filter((emp) => {
			const matchType = data.type.length === 0 || data.type.includes(emp.type);
			const matchRole = data.role.length === 0 || data.role.includes(emp.role);
			const matchStatus =
				data.status.length === 0 || data.status.includes(emp.status);

			return matchType && matchRole && matchStatus;
		});

		// 2. Ordenação
		filteredData.sort((a, b) => {
			const field = data.sortBy as keyof Employee;
			const valA = a[field]!;
			const valB = b[field]!;

			if (valA < valB) return data.sortOrder === "asc" ? -1 : 1;
			if (valA > valB) return data.sortOrder === "asc" ? 1 : -1;
			return 0;
		});

		// 3. Paginação
		const total = filteredData.length;
		const startIndex = (data.page - 1) * data.limit;
		const paginatedData = filteredData.slice(
			startIndex,
			startIndex + data.limit,
		);

		return {
			items: paginatedData,
			total,
		};
	});

export const employeesQueryOptions = (search: EmployeeSearch) =>
	queryOptions({
		queryKey: ["employees", search],
		queryFn: () => getEmployees({ data: search }),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
