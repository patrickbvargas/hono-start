import { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import type {
	EntityFilterParams,
	EntitySearchParams,
	EntityUniqueParams,
} from "@/shared/types/entity";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import type { EmployeeFilter } from "../schemas/filter";
import {
	type EmployeeDetail,
	type EmployeeSummary,
	employeeDetailSchema,
	employeeSummarySchema,
} from "../schemas/model";
import type { EmployeeSearch } from "../schemas/search";

interface BuildEmployeeWhereParams extends EntityFilterParams<EmployeeFilter> {
	typeIds: number[];
	roleIds: number[];
}

function buildEmployeeWhere({
	firmId,
	filter,
	typeIds,
	roleIds,
}: BuildEmployeeWhereParams): Prisma.EmployeeWhereInput {
	return {
		firmId,
		...getEntityDeletedWhere(filter.status),
		...getEntityActiveWhere(filter.active),
		...(filter.query
			? {
					OR: [
						{
							fullName: {
								contains: filter.query,
								mode: "insensitive" as const,
							},
						},
						{
							oabNumber: {
								contains: filter.query,
								mode: "insensitive" as const,
							},
						},
					],
				}
			: {}),
		...(typeIds.length > 0 ? { typeId: { in: typeIds } } : {}),
		...(roleIds.length > 0 ? { roleId: { in: roleIds } } : {}),
	};
}

// TODO: refatorar
async function getActiveContractCountByEmployeeIds(employeeIds: number[]) {
	if (employeeIds.length === 0) {
		return new Map<number, number>();
	}

	const rows = await prisma.$queryRaw<
		Array<{ employeeId: number; total: number }>
	>(Prisma.sql`
		SELECT
			"employeeId" AS "employeeId",
			COUNT(DISTINCT "contractId")::int AS "total"
		FROM "contract_employees"
		WHERE "employeeId" IN (${Prisma.join(employeeIds)})
			AND "deletedAt" IS NULL
			AND "isActive" = true
		GROUP BY "employeeId"
	`);

	return new Map(rows.map((row) => [row.employeeId, Number(row.total)]));
}

export async function getEmployees({
	firmId,
	search,
}: EntitySearchParams<EmployeeSearch>): Promise<
	QueryPaginatedReturnType<EmployeeSummary>
> {
	const [resolvedTypes, resolvedRoles] = await Promise.all([
		search.type.length > 0
			? prisma.employeeType.findMany({
					where: { value: { in: search.type } },
					select: { id: true },
				})
			: Promise.resolve([]),
		search.role.length > 0
			? prisma.userRole.findMany({
					where: { value: { in: search.role } },
					select: { id: true },
				})
			: Promise.resolve([]),
	]);

	const where = buildEmployeeWhere({
		firmId,
		filter: search,
		typeIds: resolvedTypes.map((type) => type.id),
		roleIds: resolvedRoles.map((role) => role.id),
	});

	const sortMap: Record<string, object> = {
		fullName: { fullName: search.direction },
		oabNumber: { oabNumber: search.direction },
		remunerationPercent: { remunerationPercentage: search.direction },
		type: { type: { label: search.direction } },
		role: { role: { label: search.direction } },
		isActive: { isActive: search.direction },
	};

	const orderBy = withDeterministicTieBreaker(
		sortMap[search.column] ?? { fullName: "asc" },
		{ id: "asc" },
	);

	const [rawData, total] = await Promise.all([
		prisma.employee.findMany({
			where,
			include: { type: true, role: true },
			orderBy,
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.employee.count({ where }),
	]);

	const contractCounts = await getActiveContractCountByEmployeeIds(
		rawData.map((employee) => employee.id),
	);

	const employees = rawData.map((employee) => ({
		id: employee.id,
		fullName: employee.fullName,
		oabNumber: employee.oabNumber,
		remunerationPercent: Number(employee.remunerationPercentage),
		type: employee.type.label,
		role: employee.role.label,
		contractCount: contractCounts.get(employee.id) ?? 0,
		isActive: employee.isActive,
		isSoftDeleted: Boolean(employee.deletedAt),
	}));

	return {
		data: employeeSummarySchema.array().parse(employees),
		total,
		page: search.page,
		pageSize: search.limit,
	};
}

export async function getEmployeeById({
	firmId,
	id,
}: EntityUniqueParams): Promise<QueryOneReturnType<EmployeeDetail>> {
	const rawData = await prisma.employee.findFirst({
		where: { id, firmId },
		include: {
			type: true,
			role: true,
		},
	});

	if (!rawData) {
		throw new Error(EMPLOYEE_ERRORS.NOT_FOUND);
	}

	const contractCounts = await getActiveContractCountByEmployeeIds([
		rawData.id,
	]);

	return employeeDetailSchema.parse({
		id: rawData.id,
		fullName: rawData.fullName,
		email: rawData.email,
		oabNumber: rawData.oabNumber,
		remunerationPercent: Number(rawData.remunerationPercentage),
		referrerPercent: Number(rawData.referralPercentage),
		typeId: rawData.typeId,
		type: rawData.type.label,
		typeValue: rawData.type.value,
		roleId: rawData.roleId,
		role: rawData.role.label,
		roleValue: rawData.role.value,
		contractCount: contractCounts.get(rawData.id) ?? 0,
		isActive: rawData.isActive,
		isSoftDeleted: Boolean(rawData.deletedAt),
		createdAt: rawData.createdAt.toISOString(),
		updatedAt: rawData.updatedAt?.toISOString() ?? null,
	});
}

export async function getEmployeeTypes(): Promise<QueryManyReturnType<Option>> {
	const types = await prisma.employeeType.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(types);
}

export async function getEmployeeRoles(): Promise<QueryManyReturnType<Option>> {
	const roles = await prisma.userRole.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(roles);
}
