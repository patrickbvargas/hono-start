import { clerkClient } from "@clerk/tanstack-react-start/server";
import { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import { getRequiredServerLoggedUserSession } from "@/shared/session/server";
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
import {
	getAssignableClerkRoles,
	getEmployeeClerkAccess,
} from "./clerk-access";

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
	const resolvedTypes =
		search.type.length > 0
			? await prisma.employeeType.findMany({
					where: { value: { in: search.type } },
					select: { id: true },
				})
			: [];
	const firm = await prisma.firm.findUniqueOrThrow({ where: { id: firmId } });
	const memberships = [];
	if (firm.clerkOrganizationId) {
		let offset = 0;
		while (true) {
			const page =
				await clerkClient().organizations.getOrganizationMembershipList({
					organizationId: firm.clerkOrganizationId,
					limit: 100,
					offset,
				});
			memberships.push(...page.data);
			offset += page.data.length;
			if (offset >= page.totalCount || page.data.length === 0) {
				break;
			}
		}
	}
	const roleByUserId = new Map(
		memberships.map((item) => [item.publicUserData?.userId, item.role]),
	);
	const where = {
		...buildEmployeeWhere({
			firmId,
			filter: search,
			typeIds: resolvedTypes.map((type) => type.id),
			roleIds: [],
		}),
		...(search.role.length
			? {
					clerkUserId: {
						in: memberships
							.filter((item) => search.role.includes(item.role))
							.flatMap((item) =>
								item.publicUserData ? [item.publicUserData.userId] : [],
							),
					},
				}
			: {}),
	};

	const sortMap: Record<string, object> = {
		fullName: { fullName: search.direction },
		id: { id: search.direction },
		oabNumber: { oabNumber: search.direction },
		remunerationPercent: { remunerationPercentage: search.direction },
		type: { type: { label: search.direction } },
		role: { fullName: search.direction },
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
		role:
			roleByUserId.get(employee.clerkUserId ?? undefined) ??
			"Sem associação Clerk",
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
	const accessState = await getEmployeeClerkAccess(firmId, rawData.clerkUserId);

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
		role: accessState.role ?? "Sem associação Clerk",
		roleValue: accessState.role ?? "",
		contractCount: contractCounts.get(rawData.id) ?? 0,
		hasCredentialAccount: accessState.hasCredentialAccount,
		credentialAccessStatus: accessState.status,
		hasActiveCredentialAccess: accessState.isAccessActive,
		mustChangePassword: false,
		authUserId: rawData.clerkUserId,
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
	const roles = await getAssignableClerkRoles(
		await getRequiredServerLoggedUserSession(),
	);
	return roles.map((role, index) => ({
		id: index + 1,
		value: role.key,
		label: role.name,
		isDisabled: false,
	}));
}

export async function getEmployeeTypeByValue(value: string) {
	return prisma.employeeType.findUnique({
		where: { value },
	});
}

export async function getUserRoleByValue(value: string) {
	return prisma.userRole.findUnique({
		where: { value },
	});
}
