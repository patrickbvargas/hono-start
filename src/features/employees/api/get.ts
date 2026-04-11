import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import type {
	QueryManyReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { EMPLOYEE_DATA_CACHE_KEY } from "../constants";
import type { EmployeeFilter } from "../schemas/filter";
import { type Employee, employeeSchema } from "../schemas/model";
import {
	type EmployeeRole,
	type EmployeeType,
	employeeRoleSchema,
	employeeTypeSchema,
} from "../schemas/option";
import { type EmployeeSearch, employeeSearchSchema } from "../schemas/search";

interface BuildEmployeeWhereParams {
	firmId: number;
	filter: EmployeeFilter;
}

export function buildEmployeeWhere({
	firmId,
	filter,
}: BuildEmployeeWhereParams) {
	const hasActive = filter.status.includes("Ativo");
	const hasInactive = filter.status.includes("Inativo");

	const activeWhere =
		hasActive && !hasInactive
			? { isActive: true }
			: hasInactive && !hasActive
				? { isActive: false }
				: {};

	const deletedWhere = filter.showDeleted ? {} : { deletedAt: null };

	return {
		firmId,
		...deletedWhere,
		...activeWhere,
		...(filter.name
			? {
					OR: [
						{
							fullName: {
								contains: filter.name,
								mode: "insensitive" as const,
							},
						},
						{
							oabNumber: {
								contains: filter.name,
								mode: "insensitive" as const,
							},
						},
					],
				}
			: {}),
		...(filter.type.length > 0 ? { typeId: { in: filter.type } } : {}),
		...(filter.role.length > 0 ? { roleId: { in: filter.role } } : {}),
	};
}

const getEmployees = createServerFn({ method: "GET" })
	.inputValidator(employeeSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<Employee>> => {
		try {
			// TODO: replace with session firmId
			const firmId = 1;

			const where = buildEmployeeWhere({ firmId, filter: data });

			const sortMap: Record<string, object> = {
				fullName: { fullName: data.direction },
				oabNumber: { oabNumber: data.direction },
				remunerationPercent: { remunerationPercentage: data.direction },
				type: { type: { label: data.direction } },
				role: { role: { label: data.direction } },
				status: { isActive: data.direction },
			};
			const orderBy = [
				sortMap[data.column] ?? { fullName: "asc" },
				{ id: "asc" },
			];

			const [employees, total] = await Promise.all([
				prisma.employee.findMany({
					where,
					include: { type: true, role: true },
					orderBy,
					skip: (data.page - 1) * data.limit,
					take: data.limit,
				}),
				prisma.employee.count({ where }),
			]);

			const mapped = employees.map((emp) => ({
				id: emp.id,
				fullName: emp.fullName,
				email: emp.email,
				oabNumber: emp.oabNumber,
				remunerationPercent: Number(emp.remunerationPercentage),
				referrerPercent: Number(emp.referralPercentage),
				typeId: emp.typeId,
				roleId: emp.roleId,
				type: emp.type.label,
				role: emp.role.label,
				contractCount: 0, // TODO: add when ContractEmployee model is available
				isActive: emp.isActive,
				isSoftDeleted: !!emp.deletedAt,
				createdAt: emp.createdAt.toISOString(),
				updatedAt: emp.updatedAt?.toISOString() ?? null,
			}));

			return {
				data: employeeSchema.array().parse(mapped),
				total,
				page: data.page,
				pageSize: data.limit,
			};
		} catch (error) {
			console.error("[getEmployees]", error);
			throw new Error("Erro ao buscar funcionários");
		}
	});

const getEmployeeTypes = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<EmployeeType>> => {
		try {
			const types = await prisma.employeeType.findMany({
				orderBy: { label: "asc" },
			});
			return employeeTypeSchema.array().parse(types);
		} catch (error) {
			console.error("[getEmployeeTypes]", error);
			throw new Error("Erro ao buscar tipos de funcionário");
		}
	},
);

const getEmployeeRoles = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<EmployeeRole>> => {
		try {
			const roles = await prisma.userRole.findMany({
				orderBy: { label: "asc" },
			});
			return employeeRoleSchema.array().parse(roles);
		} catch (error) {
			console.error("[getEmployeeRoles]", error);
			throw new Error("Erro ao buscar cargos de funcionário");
		}
	},
);

export const getEmployeesOptions = (search: EmployeeSearch) =>
	queryOptions({
		queryKey: [EMPLOYEE_DATA_CACHE_KEY, search],
		queryFn: () => getEmployees({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getEmployeeTypesOptions = () =>
	queryOptions({
		queryKey: [EMPLOYEE_DATA_CACHE_KEY, "types"],
		queryFn: getEmployeeTypes,
		staleTime: "static",
	});

export const getEmployeeRolesOptions = () =>
	queryOptions({
		queryKey: [EMPLOYEE_DATA_CACHE_KEY, "roles"],
		queryFn: getEmployeeRoles,
		staleTime: "static",
	});
