import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { type Option, optionSchema } from "@/shared/schemas/option";
import type {
	QueryManyReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { EMPLOYEE_DATA_CACHE_KEY } from "../constants";
import { type Employee, employeeSchema } from "../schemas/model";
import { type EmployeeSearch, employeeSearchSchema } from "../schemas/search";

const getEmployees = createServerFn({ method: "GET" })
	.inputValidator(employeeSearchSchema)
	.handler(async ({ data }): Promise<QueryPaginatedReturnType<Employee>> => {
		try {
			// TODO: replace with session firmId
			const firmId = 1;

			const statusWhere =
				data.status.length === 1 && data.status.includes("Ativo")
					? { deletedAt: null }
					: data.status.length === 1 && data.status.includes("Inativo")
						? { NOT: { deletedAt: null } }
						: data.status.length === 0
							? { deletedAt: null }
							: {};

			const where = {
				firmId,
				...statusWhere,
				...(data.type.length > 0 ? { type: { label: { in: data.type } } } : {}),
				...(data.role.length > 0 ? { role: { label: { in: data.role } } } : {}),
			};

			const sortMap: Record<string, object> = {
				fullName: { fullName: data.direction },
				oabNumber: { oabNumber: data.direction },
				remunerationPercent: { remunerationPercentage: data.direction },
				type: { type: { label: data.direction } },
				role: { role: { label: data.direction } },
				status: { deletedAt: data.direction },
			};
			const orderBy = [
				sortMap[data.column] ?? { fullName: "asc" },
				{ id: "asc" },
			];

			const [employees, total] = await Promise.all([
				db.employee.findMany({
					where,
					include: { type: true, role: true },
					orderBy,
					skip: (data.page - 1) * data.limit,
					take: data.limit,
				}),
				db.employee.count({ where }),
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
				slug: emp.fullName.toLowerCase().replace(/\s+/g, "-"),
				status: emp.deletedAt ? "Inativo" : "Ativo",
				contractCount: 0, // TODO: add when ContractEmployee model is available
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
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const types = await db.employeeType.findMany({
				orderBy: { label: "asc" },
			});
			return optionSchema
				.array()
				.parse(types.map((t) => ({ id: t.id, description: t.label })));
		} catch (error) {
			console.error("[getEmployeeTypes]", error);
			throw new Error("Erro ao buscar tipos de funcionário");
		}
	},
);

const getEmployeeRoles = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			const roles = await db.userRole.findMany({ orderBy: { label: "asc" } });
			return optionSchema
				.array()
				.parse(roles.map((r) => ({ id: r.id, description: r.label })));
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
