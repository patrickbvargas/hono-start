import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { EMPLOYEE_DATA_CACHE_KEY } from "../constants";
import type { Employee } from "../schemas/model";
import { type EmployeeSearch, employeeSearchSchema } from "../schemas/search";

export const mockData: Employee[] = [
	{
		id: "1",
		fullName: "Alice Ferreira Santos",
		oabNumber: "234567",
		remunerationPercent: 40,
		type: "Advogado",
		role: "Sócio",
		slug: "alice-ferreira-santos",
		status: "Ativo",
		contractCount: 25,
		createdAt: "2024-01-15T10:30:00.000Z",
		updatedAt: "2024-05-20T14:45:12.000Z",
	},
	{
		id: "2",
		fullName: "Bruno Mendes Oliveira",
		oabNumber: "890123",
		remunerationPercent: 30,
		type: "Consultor",
		role: "Colaborador",
		slug: "bruno-mendes-oliveira",
		status: "Ativo",
		contractCount: 5,
		createdAt: "2024-02-10T08:15:00.000Z",
		updatedAt: "2024-02-10T08:15:00.000Z",
	},
	{
		id: "3",
		fullName: "Carla Souza Lima",
		oabNumber: "456789",
		remunerationPercent: 50,
		type: "Médico",
		role: "Administrador",
		slug: "carla-souza-lima",
		status: "Inativo",
		contractCount: 0,
		createdAt: "2023-11-05T16:20:30.000Z",
		updatedAt: "2024-01-12T09:00:00.000Z",
	},
	{
		id: "4",
		fullName: "Diego Rocha Pires",
		oabNumber: "112233",
		remunerationPercent: 45,
		type: "Advogado",
		role: "Associado",
		slug: "diego-rocha-pires",
		status: "Ativo",
		contractCount: 12,
		createdAt: "2024-03-22T11:00:00.000Z",
		updatedAt: "2024-05-15T17:30:45.000Z",
	},
	{
		id: "5",
		fullName: "Elena Martins Costa",
		oabNumber: "445566",
		remunerationPercent: 60,
		type: "Engenheiro",
		role: "Diretor",
		slug: "elena-martins-costa",
		status: "Ativo",
		contractCount: 18,
		createdAt: "2023-08-14T07:45:00.000Z",
		updatedAt: "2024-06-01T12:00:00.000Z",
	},
	{
		id: "6",
		fullName: "Fabio Junior Silva",
		oabNumber: "778899",
		remunerationPercent: 20,
		type: "Assistente",
		role: "Suporte",
		slug: "fabio-junior-silva",
		status: "Ativo",
		contractCount: 2,
		createdAt: "2024-05-01T13:10:00.000Z",
		updatedAt: "2024-05-01T13:10:00.000Z",
	},
	{
		id: "7",
		fullName: "Giovanna Albuquerque",
		oabNumber: "334455",
		remunerationPercent: 55,
		type: "Médico",
		role: "Especialista",
		slug: "giovanna-albuquerque",
		status: "Ativo",
		contractCount: 30,
		createdAt: "2023-12-10T15:20:00.000Z",
		updatedAt: "2024-04-18T10:15:00.000Z",
	},
	{
		id: "8",
		fullName: "Henrique Duarte",
		oabNumber: "667788",
		remunerationPercent: 35,
		type: "Contador",
		role: "Gerente",
		slug: "henrique-duarte",
		status: "Pendente",
		contractCount: 8,
		createdAt: "2024-01-30T09:40:00.000Z",
		updatedAt: "2024-02-15T11:20:00.000Z",
	},
	{
		id: "9",
		fullName: "Isabela Fontana",
		oabNumber: "990011",
		remunerationPercent: 40,
		type: "Advogado",
		role: "Sócio Sênior",
		slug: "isabela-fontana",
		status: "Ativo",
		contractCount: 42,
		createdAt: "2023-06-20T14:00:00.000Z",
		updatedAt: "2024-06-05T16:45:00.000Z",
	},
	{
		id: "10",
		fullName: "João Vitor Neves",
		oabNumber: "223344",
		remunerationPercent: 25,
		type: "Analista",
		role: "Operacional",
		slug: "joao-vitor-neves",
		status: "Ativo",
		contractCount: 15,
		createdAt: "2024-04-12T10:00:00.000Z",
		updatedAt: "2024-04-12T10:00:00.000Z",
	},
];

export const getEmployees = createServerFn({ method: "GET" })
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

export const getEmployeesOptions = (search: EmployeeSearch) =>
	queryOptions({
		queryKey: [EMPLOYEE_DATA_CACHE_KEY, search],
		queryFn: () => getEmployees({ data: search }),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
