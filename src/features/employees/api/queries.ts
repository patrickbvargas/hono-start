import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import type { EntityId } from "@/shared/schemas/entity";
import type { Option } from "@/shared/schemas/option";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
} from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import {
	getEmployeeById,
	getEmployeeRoles,
	getEmployees,
	getEmployeeTypes,
} from "../data/queries";
import { employeeIdInputSchema } from "../schemas/form";
import type { EmployeeDetail, EmployeeSummary } from "../schemas/model";
import { type EmployeeSearch, employeeSearchSchema } from "../schemas/search";

export const employeeKeys = {
	all: ["employee"] as const,
	list: (search: EmployeeSearch) => [...employeeKeys.all, search] as const,
	detail: (id: EntityId) => [...employeeKeys.all, "detail", id] as const,
	types: () => [...employeeKeys.all, "types"] as const,
	roles: () => [...employeeKeys.all, "roles"] as const,
};

const getEmployeesFn = createServerFn({ method: "GET" })
	.inputValidator(employeeSearchSchema)
	.handler(
		async ({ data }): Promise<QueryPaginatedReturnType<EmployeeSummary>> => {
			try {
				const session = getServerLoggedUserSession();
				assertCan(session, "employee.manage");
				const { firmId } = getServerScope("employee");

				return await getEmployees({ firmId, search: data });
			} catch (error) {
				console.error("[getEmployees]", error);
				if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
					throw error;
				}

				throw new Error(EMPLOYEE_ERRORS.GET_FAILED);
			}
		},
	);

const getEmployeeByIdFn = createServerFn({ method: "GET" })
	.inputValidator(employeeIdInputSchema)
	.handler(async ({ data }): Promise<QueryOneReturnType<EmployeeDetail>> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "employee.manage");
			const { firmId } = getServerScope("employee");

			return await getEmployeeById({ firmId, id: data.id });
		} catch (error) {
			console.error("[getEmployeeById]", error);
			if (hasExactErrorMessage(error, EMPLOYEE_ERRORS)) {
				throw error;
			}

			throw new Error(EMPLOYEE_ERRORS.GET_FAILED);
		}
	});

const getEmployeeTypesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			return await getEmployeeTypes();
		} catch (error) {
			console.error("[getEmployeeTypes]", error);
			throw new Error(EMPLOYEE_ERRORS.TYPES_GET_FAILED);
		}
	},
);

const getEmployeeRolesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<QueryManyReturnType<Option>> => {
		try {
			return await getEmployeeRoles();
		} catch (error) {
			console.error("[getEmployeeRoles]", error);
			throw new Error(EMPLOYEE_ERRORS.ROLES_GET_FAILED);
		}
	},
);

export const getEmployeesQueryOptions = (search: EmployeeSearch) =>
	queryOptions({
		queryKey: employeeKeys.list(search),
		queryFn: () => getEmployeesFn({ data: search }),
		staleTime: 5 * 60 * 1000,
	});

export const getEmployeeByIdQueryOptions = (id: EntityId) =>
	queryOptions({
		queryKey: employeeKeys.detail(id),
		queryFn: () => getEmployeeByIdFn({ data: { id } }),
		staleTime: 5 * 60 * 1000,
	});

export const getEmployeeTypesQueryOptions = () =>
	queryOptions({
		queryKey: employeeKeys.types(),
		queryFn: getEmployeeTypesFn,
		staleTime: "static",
	});

export const getEmployeeRolesQueryOptions = () =>
	queryOptions({
		queryKey: employeeKeys.roles(),
		queryFn: getEmployeeRolesFn,
		staleTime: "static",
	});
