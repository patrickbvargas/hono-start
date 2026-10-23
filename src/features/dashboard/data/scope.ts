import type { Prisma } from "@/generated/prisma/client";
import type { DashboardSearch } from "../schemas/search";

export interface DashboardScope {
	canReadCashFlow?: boolean;
	firmId: number;
	employeeId?: number;
	isAdmin: boolean;
	search: DashboardSearch;
}

interface EffectiveEmployeeParams {
	isAdmin: boolean;
	requestedEmployeeId?: number;
	sessionEmployeeId?: number;
}

interface DashboardDimensionFilters {
	legalArea: string[];
	revenueType: string[];
}

function parseOptionalEntityId(value: string): number | undefined {
	if (!value) {
		return undefined;
	}

	const parsed = Number(value);

	if (!Number.isInteger(parsed) || parsed <= 0) {
		return undefined;
	}

	return parsed;
}

function parseLookupValues(values: string[]): string[] {
	return values.filter((value) => value.length > 0);
}

function getDashboardDimensionFilters(
	search: DashboardSearch,
): DashboardDimensionFilters {
	return {
		legalArea: parseLookupValues(search.legalArea),
		revenueType: parseLookupValues(search.revenueType),
	};
}

export function getEffectiveDashboardEmployeeId({
	isAdmin,
	requestedEmployeeId,
	sessionEmployeeId,
}: EffectiveEmployeeParams): number | undefined {
	if (isAdmin) {
		return requestedEmployeeId;
	}

	return sessionEmployeeId;
}

function getSelectedEmployeeId(scope: DashboardScope): number | undefined {
	return getEffectiveDashboardEmployeeId({
		isAdmin: scope.isAdmin,
		requestedEmployeeId: parseOptionalEntityId(scope.search.employeeId),
		sessionEmployeeId: scope.employeeId,
	});
}

function getDashboardContractDimensionWhere(
	scope: DashboardScope,
): Prisma.ContractWhereInput {
	const { legalArea, revenueType } = getDashboardDimensionFilters(scope.search);

	return {
		...(legalArea.length > 0
			? { legalArea: { value: { in: legalArea } } }
			: {}),
		...(revenueType.length > 0
			? {
					revenues: {
						some: {
							firmId: scope.firmId,
							deletedAt: null,
							isActive: true,
							type: {
								value: { in: revenueType },
							},
						},
					},
				}
			: {}),
	};
}

export function getDashboardRevenueWhere(
	scope: DashboardScope,
): Prisma.RevenueWhereInput {
	const { revenueType } = getDashboardDimensionFilters(scope.search);

	return {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
		...(revenueType.length > 0 ? { type: { value: { in: revenueType } } } : {}),
		contract: {
			firmId: scope.firmId,
			deletedAt: null,
			isActive: true,
			...getAssignedContractWhere(scope),
			...getDashboardContractDimensionWhere(scope),
		},
	};
}

export function getDashboardFeeRevenueWhere(
	scope: DashboardScope,
): Prisma.FeeWhereInput["revenue"] {
	return {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
		...(() => {
			const { revenueType } = getDashboardDimensionFilters(scope.search);

			return revenueType.length > 0
				? { type: { value: { in: revenueType } } }
				: {};
		})(),
		contract: {
			firmId: scope.firmId,
			deletedAt: null,
			isActive: true,
			...getAssignedContractWhere(scope),
			...getDashboardContractDimensionWhere(scope),
		},
	};
}

export function getDashboardRemunerationWhere(
	scope: DashboardScope,
): Prisma.RemunerationWhereInput {
	const employeeId = getSelectedEmployeeId(scope);
	const { legalArea, revenueType } = getDashboardDimensionFilters(scope.search);

	return {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
		...(revenueType.length > 0
			? {
					fee: {
						revenue: {
							type: {
								value: { in: revenueType },
							},
						},
					},
				}
			: {}),
		contractEmployee: {
			...(employeeId ? { employeeId } : {}),
			...(legalArea.length > 0
				? {
						contract: {
							legalArea: {
								value: { in: legalArea },
							},
						},
					}
				: {}),
		},
	};
}

export function getDashboardExpenseWhere(
	scope: DashboardScope,
): Prisma.ExpenseWhereInput {
	return {
		firmId: scope.firmId,
		deletedAt: null,
		isActive: true,
	};
}

function getAssignedContractWhere(scope: DashboardScope) {
	const employeeId = getSelectedEmployeeId(scope);

	if (scope.isAdmin && !employeeId) {
		return {};
	}

	if (!employeeId) {
		throw new Error(
			"Não foi possível identificar o colaborador da sessão para consultar o dashboard",
		);
	}

	return {
		assignments: {
			some: {
				firmId: scope.firmId,
				employeeId,
				deletedAt: null,
				isActive: true,
			},
		},
	};
}
