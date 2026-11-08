import type { Prisma } from "@/generated/prisma/client";
import type { DashboardSearch } from "../schemas/search";
export interface DashboardScope {
	canReadCashFlow?: boolean;
	access?: {
		revenue: boolean;
		remuneration: boolean;
		expense: boolean;
		revenueAll: boolean;
		remunerationAll: boolean;
		receipts?: boolean;
		payments?: boolean;
	};
	firmId: number;
	personId?: number;
	employeeId?: number;
	employeeTypeValue?: string;
	isAdmin: boolean;
	search: DashboardSearch;
}
export function getEffectiveDashboardEmployeeId({
	isAdmin,
	requestedEmployeeId,
	sessionEmployeeId,
}: {
	isAdmin: boolean;
	requestedEmployeeId?: number;
	sessionEmployeeId?: number;
}) {
	return isAdmin ? requestedEmployeeId : sessionEmployeeId;
}
export function canReadDashboardFirmResult(s: DashboardScope): boolean {
	return (
		s.isAdmin &&
		s.canReadCashFlow === true &&
		s.access?.revenueAll === true &&
		s.access.remunerationAll &&
		s.access.revenue &&
		s.access.remuneration &&
		s.access.expense &&
		s.access.receipts === true &&
		s.access.payments === true &&
		!s.search.employeeId &&
		!s.search.clientId &&
		!s.search.contractId &&
		!s.search.legalArea.length &&
		!s.search.revenueType.length
	);
}
export function getDashboardContractWhere(
	s: DashboardScope,
	all: boolean,
): Prisma.ContractWhereInput {
	const employeeId = all
		? Number(s.search.employeeId) || undefined
		: s.employeeId;
	const types =
		s.employeeTypeValue === "LAWYER"
			? ["RESPONSIBLE", "RECOMMENDED"]
			: s.employeeTypeValue === "ADMIN_ASSISTANT"
				? ["ADMIN_ASSISTANT"]
				: [];
	return {
		firmId: s.firmId,
		...(s.search.clientId ? { customerId: Number(s.search.clientId) } : {}),
		...(s.search.contractId ? { id: Number(s.search.contractId) } : {}),
		...(s.search.legalArea.length
			? { legalArea: { value: { in: s.search.legalArea } } }
			: {}),
		...(!all || employeeId
			? {
					assignments: {
						some: {
							firmId: s.firmId,
							employeeProfileId: employeeId ?? -1,
							isActive: true,
							deletedAt: null,
							...(!all
								? {
										assignmentType: { value: { in: types } },
										employeeProfile: {
											employeeType: { value: s.employeeTypeValue ?? "" },
										},
									}
								: {}),
						},
					},
				}
			: {}),
	};
}
export function getDashboardReceivableWhere(
	s: DashboardScope,
): Prisma.ReceivableWhereInput {
	const needsContract =
		!s.access?.revenueAll ||
		Boolean(
			s.search.employeeId ||
				s.search.clientId ||
				s.search.contractId ||
				s.search.legalArea.length ||
				s.search.revenueType.length,
		);
	return {
		firmId: s.firmId,
		...(needsContract
			? {
					contractRevenueReceivable: {
						firmId: s.firmId,
						contract: getDashboardContractWhere(
							s,
							s.access?.revenueAll === true,
						),
						...(s.search.revenueType.length
							? {
									revenue: {
										revenueType: { value: { in: s.search.revenueType } },
									},
								}
							: {}),
					},
				}
			: {}),
	};
}
export function getDashboardPayableWhere(
	s: DashboardScope,
): Prisma.PayableWhereInput {
	const all = s.access?.remunerationAll === true;
	const remuneration: Prisma.PayableWhereInput = {
		...(!all ? { beneficiary: { personId: s.personId ?? -1 } } : {}),
		remunerationPayable: {
			firmId: s.firmId,
			contractAssignment: {
				firmId: s.firmId,
				...(!all || s.search.employeeId
					? {
							employeeProfileId: all
								? Number(s.search.employeeId)
								: (s.employeeId ?? -1),
						}
					: {}),
				contract: getDashboardContractWhere(s, all),
			},
			...(s.search.revenueType.length
				? {
						receipt: {
							receivable: {
								contractRevenueReceivable: {
									revenue: {
										revenueType: { value: { in: s.search.revenueType } },
									},
								},
							},
						},
					}
				: {}),
		},
	};
	return {
		firmId: s.firmId,
		OR: [
			...(s.access?.remuneration ? [remuneration] : []),
			...(s.access?.expense && all ? [{ remunerationPayable: null }] : []),
		],
	};
}
