import type { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import type { RemunerationFilter } from "../schemas/filter";
import { remunerationSchema } from "../schemas/model";
import type { RemunerationSearch } from "../schemas/search";

interface BuildRemunerationWhereParams {
	firmId: number;
	employeeId?: number;
	filter: RemunerationFilter;
	isAdmin: boolean;
}

export function buildRemunerationWhere({
	firmId,
	employeeId,
	filter,
	isAdmin,
}: BuildRemunerationWhereParams): Prisma.RemunerationWhereInput {
	if (!isAdmin && !employeeId) {
		throw new Error(
			"Não foi possível identificar o colaborador da sessão para consultar remunerações",
		);
	}

	const dateFilter: Prisma.DateTimeFilter = {};

	if (filter.dateFrom) {
		dateFilter.gte = new Date(`${filter.dateFrom}T00:00:00.000Z`);
	}

	if (filter.dateTo) {
		dateFilter.lte = new Date(`${filter.dateTo}T23:59:59.999Z`);
	}

	return {
		firmId,
		...getEntityDeletedWhere(filter.status),
		...getEntityActiveWhere(filter.active),
		...(filter.dateFrom || filter.dateTo ? { paymentDate: dateFilter } : {}),
		contractEmployee: {
			...(filter.contractId ? { contractId: Number(filter.contractId) } : {}),
			...(isAdmin
				? filter.employeeId
					? { employeeId: Number(filter.employeeId) }
					: {}
				: employeeId
					? { employeeId }
					: {}),
		},
	};
}

export function getRemunerationOrderBy(search: RemunerationSearch) {
	const sortMap: Record<string, Prisma.RemunerationOrderByWithRelationInput> = {
		amount: { amount: search.direction },
		createdAt: { createdAt: search.direction },
		effectivePercentage: { effectivePercentage: search.direction },
		employeeName: {
			contractEmployee: {
				employee: {
					fullName: search.direction,
				},
			},
		},
		paymentDate: { paymentDate: search.direction },
	};

	return withDeterministicTieBreaker(
		sortMap[search.column] ?? { paymentDate: "desc" },
		{ id: "asc" },
	);
}

export const remunerationListInclude = {
	contractEmployee: {
		select: {
			id: true,
			contractId: true,
			employeeId: true,
			employee: {
				select: {
					fullName: true,
				},
			},
			contract: {
				select: {
					processNumber: true,
					client: {
						select: {
							fullName: true,
						},
					},
				},
			},
		},
	},
	fee: {
		select: {
			id: true,
			amount: true,
			installmentNumber: true,
			deletedAt: true,
		},
	},
} as const;

export async function mapRemunerations(
	remunerations: Array<{
		id: number;
		contractEmployeeId: number;
		effectivePercentage: Prisma.Decimal;
		amount: Prisma.Decimal;
		paymentDate: Date;
		isSystemGenerated: boolean;
		isActive: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
		contractEmployee: {
			id: number;
			contractId: number;
			employeeId: number;
			employee: {
				fullName: string;
			};
			contract: {
				processNumber: string;
				client: {
					fullName: string;
				};
			};
		};
		fee: {
			id: number;
			amount: Prisma.Decimal;
			installmentNumber: number;
			deletedAt: Date | null;
		};
	}>,
) {
	return remunerationSchema.array().parse(
		remunerations.map((remuneration) => ({
			id: remuneration.id,
			contractEmployeeId: remuneration.contractEmployeeId,
			employeeId: remuneration.contractEmployee.employeeId,
			employeeName: remuneration.contractEmployee.employee.fullName,
			client: remuneration.contractEmployee.contract.client.fullName,
			contractId: remuneration.contractEmployee.contractId,
			contractProcessNumber:
				remuneration.contractEmployee.contract.processNumber,
			feeId: remuneration.fee.id,
			feeAmount: Number(remuneration.fee.amount),
			feeInstallmentNumber: remuneration.fee.installmentNumber,
			paymentDate: remuneration.paymentDate.toISOString(),
			amount: Number(remuneration.amount),
			effectivePercentage: Number(remuneration.effectivePercentage),
			isManualOverride: !remuneration.isSystemGenerated,
			isSystemGenerated: remuneration.isSystemGenerated,
			isActive: remuneration.isActive,
			isSoftDeleted: remuneration.deletedAt !== null,
			parentFeeIsSoftDeleted: remuneration.fee.deletedAt !== null,
			createdAt: remuneration.createdAt.toISOString(),
			updatedAt: remuneration.updatedAt.toISOString(),
		})),
	);
}
