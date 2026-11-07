import { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
	withDeterministicTieBreaker,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import {
	SESSION_ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
	SESSION_ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	SESSION_ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
	SESSION_EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE,
	type SessionAssignmentSummary,
} from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { CONTRACT_ERRORS } from "../constants/errors";
import {
	ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
} from "../constants/values";
import type { ContractFilter } from "../schemas/filter";
import {
	type ContractDetail,
	type ContractSummary,
	contractDetailSchema,
	contractSummarySchema,
} from "../schemas/model";
import type { ContractSearch } from "../schemas/search";
import { getInstallmentDetails } from "../utils/installment-details";
import { getNextContractInstallment } from "../utils/payment-plan";

interface ContractAccessParams {
	firmId: number;
	employeeId?: number;
	employeeTypeValue?: string;
	isAdmin: boolean;
}

interface BuildContractWhereParams extends ContractAccessParams {
	filter: ContractFilter;
	clientId?: number;
	legalAreaIds: number[];
	statusIds: number[];
}

interface GetContractsParams {
	scope: ContractAccessParams;
	search: ContractSearch;
}

interface GetContractByIdParams {
	scope: ContractAccessParams;
	id: number;
}

function getVisibleAssignmentTypeValues(employeeTypeValue?: string) {
	if (employeeTypeValue === SESSION_EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE) {
		return [SESSION_ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE];
	}

	return [
		SESSION_ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
		SESSION_ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	];
}

function isProfileModelActive() {
	return Boolean(prisma.clientProfile || prisma.employeeProfile);
}

function buildVisibleAssignmentWhere(
	employeeId?: number,
	employeeTypeValue?: string,
) {
	if (!employeeId) {
		return undefined;
	}

	const isProfile = isProfileModelActive();

	return {
		...(isProfile ? { employeeProfileId: employeeId } : { employeeId }),
		deletedAt: null,
		isActive: true,
		assignmentType: {
			value: {
				in: getVisibleAssignmentTypeValues(employeeTypeValue),
			},
		},
	};
}

function mapAssignmentSummaries(
	assignments: Array<{
		employeeProfileId?: number;
		employeeId?: number;
		employeeProfile?: {
			employeeType: {
				value: string;
			};
		};
		employee?: {
			type: {
				value: string;
			};
		};
		assignmentType: {
			value: string;
		};
	}>,
): SessionAssignmentSummary[] {
	return assignments.map((assignment) => ({
		employeeId: assignment.employeeProfileId ?? assignment.employeeId ?? 0,
		employeeTypeValue:
			assignment.employeeProfile?.employeeType.value ??
			assignment.employee?.type.value ??
			"",
		assignmentTypeValue: assignment.assignmentType.value,
	}));
}

function getHandlingLawyerName(
	assignments: Array<{
		employeeProfileId?: number;
		employeeId?: number;
		employeeProfile?: {
			person: {
				fullName: string;
			};
		};
		employee?: {
			fullName: string;
		};
		assignmentType: {
			value: string;
		};
	}>,
) {
	const responsibleAssignment = assignments.find(
		(assignment) =>
			assignment.assignmentType.value === ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
	);

	if (responsibleAssignment) {
		return (
			responsibleAssignment.employeeProfile?.person.fullName ??
			responsibleAssignment.employee?.fullName ??
			"—"
		);
	}

	const recommendedAssignment = assignments.find(
		(assignment) =>
			assignment.assignmentType.value === ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	);

	if (recommendedAssignment) {
		return (
			recommendedAssignment.employeeProfile?.person.fullName ??
			recommendedAssignment.employee?.fullName ??
			"—"
		);
	}

	return "—";
}

function buildContractWhere({
	firmId,
	employeeId,
	employeeTypeValue,
	filter,
	clientId,
	legalAreaIds,
	statusIds,
	isAdmin,
}: BuildContractWhereParams) {
	const isProfile = isProfileModelActive();

	return {
		firmId,
		...getEntityDeletedWhere(filter.status),
		...getEntityActiveWhere(filter.active),
		...(filter.query
			? {
					OR: [
						{
							processNumber: {
								contains: filter.query,
								mode: "insensitive" as const,
							},
						},
						isProfile
							? {
									customer: {
										person: {
											fullName: {
												contains: filter.query,
												mode: "insensitive" as const,
											},
										},
									},
								}
							: {
									client: {
										fullName: {
											contains: filter.query,
											mode: "insensitive" as const,
										},
									},
								},
					],
				}
			: {}),
		...(clientId ? (isProfile ? { customerId: clientId } : { clientId }) : {}),
		...(filter.employeeId
			? {
					AND: [
						{
							assignments: {
								some: {
									...(isProfile
										? { employeeProfileId: Number(filter.employeeId) }
										: { employeeId: Number(filter.employeeId) }),
									isActive: true,
									deletedAt: null,
								},
							},
						},
					],
				}
			: {}),
		...(legalAreaIds.length > 0 ? { legalAreaId: { in: legalAreaIds } } : {}),
		...(statusIds.length > 0 ? { statusId: { in: statusIds } } : {}),
		...(!isAdmin && employeeId
			? {
					assignments: {
						some: buildVisibleAssignmentWhere(employeeId, employeeTypeValue),
					},
				}
			: {}),
	};
}

function getRevenuePaymentState(revenue: {
	totalValue: { toString(): string };
	downPaymentValue: { toString(): string } | null;
	fees: Array<{ amount: { toString(): string }; installmentNumber?: number }>;
}) {
	const paidValue = revenue.fees.reduce(
		(total, fee) => total.add(fee.amount.toString()),
		new Prisma.Decimal(revenue.downPaymentValue?.toString() ?? 0),
	);
	const remainingValue = Prisma.Decimal.max(
		new Prisma.Decimal(revenue.totalValue.toString()).minus(paidValue),
		new Prisma.Decimal(0),
	);

	return {
		paidValue: Number(paidValue),
		installmentsPaid: revenue.fees.length,
		remainingValue: Number(remainingValue),
		isFullyPaid: remainingValue.equals(0),
	};
}

function mapContractSummary(
	scope: ContractAccessParams,
	contracts: Array<{
		id: number;
		processNumber: string;
		customerId?: number;
		clientId?: number;
		legalAreaId: number;
		statusId: number;
		feePercentage: { toString(): string };
		isActive: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date | null;
		customer?: {
			id: number;
			personId: number;
			person: { fullName: string; document: string | null };
		};
		client?: { fullName: string };
		legalArea: { label: string; value: string };
		status: { label: string; value: string };
		assignments: Array<{
			employeeProfileId?: number;
			employeeId?: number;
			employeeProfile?: {
				id: number;
				personId: number;
				person: { fullName: string };
				employeeType: { value: string };
			};
			employee?: {
				fullName: string;
				type: { value: string };
			};
			assignmentType: { value: string };
		}>;
		revenues: Array<{ id: number }>;
	}>,
) {
	return contractSummarySchema.array().parse(
		contracts.map((contract) => {
			const assignmentSummaries = mapAssignmentSummaries(contract.assignments);
			const assignedEmployeeIds = contract.assignments.map(
				(assignment) =>
					assignment.employeeProfileId ?? assignment.employeeId ?? 0,
			);
			const clientId = contract.customerId ?? contract.clientId ?? 0;
			const clientPersonId = contract.customer?.personId ?? clientId;
			const clientName =
				contract.customer?.person.fullName ?? contract.client?.fullName ?? "—";
			const clientDoc = contract.customer?.person.document ?? null;

			return {
				id: contract.id,
				processNumber: contract.processNumber,
				clientId,
				clientPersonId,
				client: clientName,
				clientDocument: clientDoc,
				lawyer: getHandlingLawyerName(contract.assignments),
				legalAreaId: contract.legalAreaId,
				legalArea: contract.legalArea.label,
				legalAreaValue: contract.legalArea.value,
				statusId: contract.statusId,
				status: contract.status.label,
				statusValue: contract.status.value,
				feePercentage: Number(contract.feePercentage),
				assignmentCount: assignedEmployeeIds.length,
				revenueCount: contract.revenues.length,
				assignedEmployeeIds,
				isAssignedToActor: scope.isAdmin
					? true
					: assignmentSummaries.some(
							(assignment) => assignment.employeeId === scope.employeeId,
						),
				isActive: contract.isActive,
				isSoftDeleted: Boolean(contract.deletedAt),
				createdAt: contract.createdAt.toISOString(),
				updatedAt: contract.updatedAt?.toISOString() ?? null,
			};
		}),
	);
}

function mapRevenueDetail(revenue: {
	id: number;
	revenueTypeId?: number;
	typeId?: number;
	totalValue?: { toString(): string } | number;
	negotiatedAmount?: { toString(): string } | number;
	downPaymentValue?: { toString(): string } | number | null;
	paymentStartDate?: Date;
	totalInstallments?: number;
	isActive: boolean;
	deletedAt: Date | null;
	createdAt?: Date;
	revenueType?: { label: string; value: string };
	type?: { label: string; value: string };
	contractRevenueReceivables?: Array<{
		receivable: {
			id: number;
			amount: { toString(): string } | number;
			dueDate: Date;
			kind: string;
			cancelledAt: Date | null;
			receipts: Array<{
				id: number;
				principalAbated: { toString(): string } | number;
				effectiveAmount: { toString(): string } | number;
				effectiveDate: Date;
				reversal?: unknown | null;
			}>;
		};
	}>;
	fees?: Array<{
		amount: { toString(): string };
		installmentNumber?: number;
		paymentDate?: Date;
	}>;
}) {
	if (revenue.fees && !revenue.contractRevenueReceivables) {
		const legacyRevenue = {
			...revenue,
			totalValue: revenue.totalValue ?? revenue.negotiatedAmount ?? 0,
			downPaymentValue: revenue.downPaymentValue ?? null,
			paymentStartDate: revenue.paymentStartDate ?? new Date(),
			totalInstallments: revenue.totalInstallments ?? 0,
			type: revenue.type ?? revenue.revenueType ?? { label: "—", value: "—" },
			fees: revenue.fees,
		};

		return {
			...getRevenuePaymentState(legacyRevenue),
			...getNextContractInstallment(legacyRevenue),
			installments: getInstallmentDetails(legacyRevenue),
			id: revenue.id,
			typeId: revenue.typeId ?? revenue.revenueTypeId ?? 0,
			type: legacyRevenue.type.label,
			typeValue: legacyRevenue.type.value,
			totalValue: Number(legacyRevenue.totalValue),
			downPaymentValue:
				legacyRevenue.downPaymentValue === null
					? null
					: Number(legacyRevenue.downPaymentValue),
			paymentStartDate: legacyRevenue.paymentStartDate.toISOString(),
			totalInstallments: legacyRevenue.totalInstallments,
			isActive: revenue.isActive,
			isSoftDeleted: Boolean(revenue.deletedAt),
		};
	}

	const receivables = (revenue.contractRevenueReceivables ?? [])
		.map((item) => item.receivable)
		.filter((item) => item && !item.cancelledAt)
		.sort(
			(a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
		);

	const entryReceivable = receivables.find(
		(item) => item.kind === "DOWN_PAYMENT",
	);
	const installmentReceivables = receivables.filter(
		(item) => item.kind !== "DOWN_PAYMENT",
	);
	const activeItems =
		installmentReceivables.length > 0 ? installmentReceivables : receivables;

	const totalValue = Number(
		revenue.negotiatedAmount ?? revenue.totalValue ?? 0,
	);
	const downPaymentValue = entryReceivable
		? Number(entryReceivable.amount)
		: revenue.downPaymentValue !== undefined &&
				revenue.downPaymentValue !== null
			? Number(revenue.downPaymentValue)
			: null;

	const getRemainingPrincipal = (receivable: (typeof receivables)[number]) =>
		Prisma.Decimal.max(
			new Prisma.Decimal(receivable.amount.toString()).minus(
				receivable.receipts
					.filter((receipt) => !receipt.reversal)
					.reduce(
						(sum, receipt) => sum.plus(receipt.principalAbated.toString()),
						new Prisma.Decimal(0),
					),
			),
			0,
		);

	const installments = activeItems.map((receivable, index) => {
		const expectedAmount = Number(receivable.amount);
		const validReceipts = (receivable.receipts ?? []).filter(
			(receipt) => !receipt.reversal,
		);
		const receivedAmount = validReceipts.reduce(
			(acc, receipt) => acc + Number(receipt.effectiveAmount),
			0,
		);
		const remainingAmount = Number(getRemainingPrincipal(receivable));
		const latestReceiptDate =
			validReceipts.length > 0
				? new Date(
						Math.max(
							...validReceipts.map((receipt) =>
								new Date(receipt.effectiveDate).getTime(),
							),
						),
					).toISOString()
				: null;

		return {
			number: index + 1,
			dueDate: new Date(receivable.dueDate).toISOString().slice(0, 10),
			expectedAmount,
			receivedAmount,
			remainingAmount,
			paymentDate: latestReceiptDate,
		};
	});

	const totalPaidValue = receivables
		.reduce(
			(sum, title) =>
				title.receipts
					.filter((receipt) => !receipt.reversal)
					.reduce(
						(paid, receipt) => paid.plus(receipt.effectiveAmount.toString()),
						sum,
					),
			new Prisma.Decimal(0),
		)
		.toNumber();
	const remainingValue = receivables
		.reduce(
			(sum, title) => sum.plus(getRemainingPrincipal(title)),
			new Prisma.Decimal(0),
		)
		.toNumber();
	const installmentsPaid = installments.filter(
		(item) => item.remainingAmount <= 0,
	).length;
	const isFullyPaid = receivables.length > 0 && remainingValue <= 0;

	const nextUnpaidInstallment = installments.find(
		(item) => item.remainingAmount > 0,
	);
	const nextInstallmentNumber = nextUnpaidInstallment
		? nextUnpaidInstallment.number
		: null;
	const nextDueDate =
		receivables
			.find((title) => getRemainingPrincipal(title).greaterThan(0))
			?.dueDate.toISOString()
			.slice(0, 10) ?? null;

	const earliestDate =
		receivables.length > 0
			? new Date(receivables[0].dueDate).toISOString()
			: revenue.createdAt
				? new Date(revenue.createdAt).toISOString()
				: new Date().toISOString();

	return {
		id: revenue.id,
		typeId: revenue.revenueTypeId ?? revenue.typeId ?? 0,
		type: revenue.revenueType?.label ?? revenue.type?.label ?? "—",
		typeValue: revenue.revenueType?.value ?? revenue.type?.value ?? "—",
		totalValue,
		downPaymentValue,
		paymentStartDate: revenue.paymentStartDate
			? revenue.paymentStartDate.toISOString()
			: earliestDate,
		totalInstallments:
			installments.length > 0
				? installments.length
				: (revenue.totalInstallments ?? 0),
		paidValue: totalPaidValue,
		hasGeneratedTitles: (revenue.contractRevenueReceivables?.length ?? 0) > 0,
		installmentsPaid,
		installments,
		nextInstallmentNumber,
		nextDueDate,
		remainingValue,
		isFullyPaid,
		isActive: revenue.isActive,
		isSoftDeleted: Boolean(revenue.deletedAt),
	};
}

function mapContractDetail(
	scope: ContractAccessParams,
	contract: {
		id: number;
		processNumber: string;
		customerId?: number;
		clientId?: number;
		legalAreaId: number;
		statusId: number;
		feePercentage: { toString(): string };
		notes: string | null;
		allowStatusChange: boolean;
		isActive: boolean;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date | null;
		customer?: {
			id: number;
			personId: number;
			person: { fullName: string; document: string | null };
		};
		client?: { fullName: string };
		legalArea: { label: string; value: string };
		status: { label: string; value: string };
		assignments: Array<{
			id: number;
			employeeProfileId?: number;
			employeeId?: number;
			isActive: boolean;
			deletedAt: Date | null;
			employeeProfile?: {
				id: number;
				personId: number;
				person: { fullName: string };
				employeeType: { label: string; value: string };
			};
			employee?: {
				fullName: string;
				type: { label: string; value: string };
			};
			assignmentType: { label: string; value: string };
		}>;
		revenues: Array<{
			id: number;
			typeId: number;
			totalValue: { toString(): string };
			downPaymentValue: { toString(): string } | null;
			paymentStartDate: Date;
			totalInstallments: number;
			isActive: boolean;
			deletedAt: Date | null;
			type: { label: string; value: string };
			fees: Array<{
				amount: { toString(): string };
				installmentNumber?: number;
				paymentDate?: Date;
			}>;
		}>;
	},
): ContractDetail {
	const activeAssignments = contract.assignments.filter(
		(assignment) => assignment.isActive && !assignment.deletedAt,
	);
	const assignedEmployeeIds = activeAssignments.map(
		(assignment) => assignment.employeeProfileId ?? assignment.employeeId ?? 0,
	);
	const assignmentSummaries = mapAssignmentSummaries(activeAssignments);
	const clientId = contract.customerId ?? contract.clientId ?? 0;
	const clientPersonId = contract.customer?.personId ?? clientId;
	const clientName =
		contract.customer?.person.fullName ?? contract.client?.fullName ?? "—";
	const clientDoc = contract.customer?.person.document ?? null;

	return contractDetailSchema.parse({
		id: contract.id,
		processNumber: contract.processNumber,
		clientId,
		clientPersonId,
		client: clientName,
		clientDocument: clientDoc,
		lawyer: getHandlingLawyerName(
			contract.assignments.filter(
				(assignment) => assignment.isActive && !assignment.deletedAt,
			),
		),
		legalAreaId: contract.legalAreaId,
		legalArea: contract.legalArea.label,
		legalAreaValue: contract.legalArea.value,
		statusId: contract.statusId,
		status: contract.status.label,
		statusValue: contract.status.value,
		feePercentage: Number(contract.feePercentage),
		notes: contract.notes,
		allowStatusChange: contract.allowStatusChange,
		assignments: contract.assignments.map((assignment) => ({
			id: assignment.id,
			employeeId: assignment.employeeProfileId ?? assignment.employeeId ?? 0,
			employeePersonId:
				assignment.employeeProfile?.personId ??
				assignment.employeeProfileId ??
				assignment.employeeId ??
				0,
			employeeName:
				assignment.employeeProfile?.person.fullName ??
				assignment.employee?.fullName ??
				"—",
			employeeType:
				assignment.employeeProfile?.employeeType.label ??
				assignment.employee?.type.label ??
				"—",
			employeeTypeValue:
				assignment.employeeProfile?.employeeType.value ??
				assignment.employee?.type.value ??
				"—",
			assignmentType: assignment.assignmentType.label,
			assignmentTypeValue: assignment.assignmentType.value,
			isActive: assignment.isActive,
			isSoftDeleted: Boolean(assignment.deletedAt),
		})),
		revenues: contract.revenues.map((revenue) =>
			mapRevenueDetail(
				revenue as unknown as Parameters<typeof mapRevenueDetail>[0],
			),
		),
		assignmentCount: contract.assignments.length,
		revenueCount: contract.revenues.length,
		assignedEmployeeIds,
		isAssignedToActor: scope.isAdmin
			? true
			: assignmentSummaries.some(
					(assignment) => assignment.employeeId === scope.employeeId,
				),
		isActive: contract.isActive,
		isSoftDeleted: Boolean(contract.deletedAt),
		createdAt: contract.createdAt.toISOString(),
		updatedAt: contract.updatedAt?.toISOString() ?? null,
	});
}

function getContractSummaryInclude() {
	if (isProfileModelActive()) {
		return {
			customer: {
				select: {
					id: true,
					personId: true,
					person: {
						select: {
							fullName: true,
							document: true,
						},
					},
				},
			},
			legalArea: { select: { label: true, value: true } },
			status: { select: { label: true, value: true } },
			assignments: {
				where: {
					deletedAt: null,
					isActive: true,
				},
				select: {
					employeeProfileId: true,
					employeeProfile: {
						select: {
							id: true,
							personId: true,
							person: {
								select: {
									fullName: true,
								},
							},
							employeeType: { select: { value: true } },
						},
					},
					assignmentType: { select: { value: true } },
				},
			},
			revenues: {
				where: {
					deletedAt: null,
					isActive: true,
				},
				select: {
					id: true,
				},
			},
		};
	}

	return {
		client: { select: { fullName: true } },
		legalArea: { select: { label: true, value: true } },
		status: { select: { label: true, value: true } },
		assignments: {
			where: {
				deletedAt: null,
				isActive: true,
			},
			select: {
				employeeId: true,
				employee: {
					select: {
						fullName: true,
						type: { select: { value: true } },
					},
				},
				assignmentType: { select: { value: true } },
			},
		},
		revenues: {
			where: {
				deletedAt: null,
				isActive: true,
			},
			select: {
				id: true,
			},
		},
	};
}

function getContractDetailInclude() {
	if (isProfileModelActive()) {
		return {
			customer: {
				select: {
					id: true,
					personId: true,
					person: {
						select: {
							fullName: true,
							document: true,
						},
					},
				},
			},
			legalArea: { select: { label: true, value: true } },
			status: { select: { label: true, value: true } },
			assignments: {
				include: {
					employeeProfile: {
						select: {
							id: true,
							personId: true,
							person: {
								select: {
									fullName: true,
								},
							},
							employeeType: { select: { label: true, value: true } },
						},
					},
					assignmentType: {
						select: { label: true, value: true },
					},
				},
			},
			revenues: {
				where: {
					deletedAt: null,
					isActive: true,
				},
				include: {
					revenueType: { select: { label: true, value: true } },
					contractRevenueReceivables: {
						include: {
							receivable: {
								include: {
									receipts: {
										where: {
											reversal: null,
										},
										select: {
											id: true,
											principalAbated: true,
											effectiveAmount: true,
											effectiveDate: true,
										},
									},
								},
							},
						},
					},
				},
			},
		};
	}

	return {
		client: { select: { fullName: true } },
		legalArea: { select: { label: true, value: true } },
		status: { select: { label: true, value: true } },
		assignments: {
			include: {
				employee: {
					select: {
						fullName: true,
						type: { select: { label: true, value: true } },
					},
				},
				assignmentType: {
					select: { label: true, value: true },
				},
			},
		},
		revenues: {
			where: {
				deletedAt: null,
				isActive: true,
			},
			include: {
				fees: {
					where: {
						deletedAt: null,
						isActive: true,
					},
					select: {
						amount: true,
						installmentNumber: true,
						paymentDate: true,
					},
				},
				type: { select: { label: true, value: true } },
			},
		},
	};
}

export async function getContracts({
	scope,
	search,
}: GetContractsParams): Promise<QueryPaginatedReturnType<ContractSummary>> {
	const [resolvedLegalAreas, resolvedStatuses] = await Promise.all([
		search.legalArea.length > 0
			? prisma.legalArea.findMany({
					where: { value: { in: search.legalArea } },
					select: { id: true },
				})
			: Promise.resolve([]),
		search.contractStatus.length > 0
			? prisma.contractStatus.findMany({
					where: { value: { in: search.contractStatus } },
					select: { id: true },
				})
			: Promise.resolve([]),
	]);

	const clientId = search.clientId ? Number(search.clientId) : undefined;
	const where = buildContractWhere({
		firmId: scope.firmId,
		employeeId: scope.employeeId,
		employeeTypeValue: scope.employeeTypeValue,
		filter: search,
		clientId,
		legalAreaIds: resolvedLegalAreas.map((item) => item.id),
		statusIds: resolvedStatuses.map((item) => item.id),
		isAdmin: scope.isAdmin,
	});

	const isProfile = isProfileModelActive();
	const sortMap: Record<string, object> = {
		id: { id: search.direction },
		processNumber: { processNumber: search.direction },
		client: isProfile
			? { customer: { person: { fullName: search.direction } } }
			: { client: { fullName: search.direction } },
		legalArea: { legalArea: { label: search.direction } },
		status: { status: { label: search.direction } },
		feePercentage: { feePercentage: search.direction },
		isActive: { isActive: search.direction },
		createdAt: { createdAt: search.direction },
	};
	const orderBy = withDeterministicTieBreaker(
		sortMap[search.column] ?? { createdAt: "desc" },
		{ id: "asc" },
	);

	const include = getContractSummaryInclude();

	const [contracts, total] = await Promise.all([
		prisma.contract.findMany({
			where,
			include: include as unknown as typeof include,
			orderBy,
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.contract.count({ where }),
	]);

	return {
		data: mapContractSummary(
			scope,
			contracts as unknown as Parameters<typeof mapContractSummary>[1],
		),
		total,
		page: search.page,
		pageSize: search.limit,
	};
}

export async function getContractById({
	scope,
	id,
}: GetContractByIdParams): Promise<QueryOneReturnType<ContractDetail>> {
	const include = getContractDetailInclude();

	const contract = await prisma.contract.findFirst({
		where: {
			...buildContractWhere({
				firmId: scope.firmId,
				employeeId: scope.employeeId,
				employeeTypeValue: scope.employeeTypeValue,
				filter: {
					query: "",
					clientId: "",
					employeeId: "",
					legalArea: [],
					contractStatus: [],
					active: "all",
					status: "all",
				},
				legalAreaIds: [],
				statusIds: [],
				isAdmin: scope.isAdmin,
			}),
			id,
		},
		include: include as unknown as typeof include,
	});

	if (!contract) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_DETAIL_NOT_FOUND);
	}

	return mapContractDetail(
		scope,
		contract as unknown as Parameters<typeof mapContractDetail>[1],
	);
}

export async function getContractAccessResourceById(id: number) {
	const isProfile = isProfileModelActive();

	const contract = await prisma.contract.findFirst({
		where: { id },
		include: {
			status: { select: { value: true } },
			assignments: {
				where: { deletedAt: null, isActive: true },
				select: {
					...(isProfile
						? {
								employeeProfileId: true,
								employeeProfile: {
									select: { employeeType: { select: { value: true } } },
								},
							}
						: {
								employeeId: true,
								employee: { select: { type: { select: { value: true } } } },
							}),
					assignmentType: { select: { value: true } },
				},
			},
			revenues: {
				where: { deletedAt: null, isActive: true },
				select: { id: true },
			},
		},
	});

	if (!contract) {
		return null;
	}

	const assignmentList = contract.assignments as unknown as Array<{
		employeeProfileId?: number;
		employeeId?: number;
		employeeProfile?: { employeeType: { value: string } };
		employee?: { type: { value: string } };
		assignmentType: { value: string };
	}>;

	return {
		id: contract.id,
		deletedAt: contract.deletedAt,
		resource: {
			firmId: contract.firmId,
			statusValue: contract.status.value,
			allowStatusChange: contract.allowStatusChange,
			assignments: mapAssignmentSummaries(assignmentList),
			assignedEmployeeIds: assignmentList.map(
				(assignment) =>
					assignment.employeeProfileId ?? assignment.employeeId ?? 0,
			),
		},
		hasActiveRevenues: contract.revenues.length > 0,
	};
}

export async function getContractLegalAreas(): Promise<
	QueryManyReturnType<Option>
> {
	const legalAreas = await prisma.legalArea.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(legalAreas);
}

export async function getContractStatuses(): Promise<
	QueryManyReturnType<Option>
> {
	const statuses = await prisma.contractStatus.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(statuses);
}

export async function getContractAssignmentTypes(): Promise<
	QueryManyReturnType<Option>
> {
	const assignmentTypes = await prisma.assignmentType.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(assignmentTypes);
}

export async function getContractRevenueTypes(): Promise<
	QueryManyReturnType<Option>
> {
	const revenueTypes = await prisma.revenueType.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(revenueTypes);
}

export async function getSelectableContractClients(
	_firmId: number,
): Promise<QueryManyReturnType<Option>> {
	if (prisma.clientProfile) {
		const clients = await prisma.clientProfile.findMany({
			where: {
				isActive: true,
				person: { deletedAt: null, isActive: true },
			},
			orderBy: { person: { fullName: "asc" } },
			select: {
				id: true,
				personId: true,
				person: {
					select: {
						fullName: true,
					},
				},
			},
		});

		return clients.map((client) => ({
			id: client.id,
			value: String(client.id),
			label: client.person.fullName,
			isDisabled: false,
		}));
	}

	const legacyClients = await (
		prisma as unknown as {
			client: { findMany: (args: unknown) => Promise<unknown[]> };
		}
	).client.findMany({
		where: { deletedAt: null, isActive: true },
		orderBy: { fullName: "asc" },
		select: {
			id: true,
			fullName: true,
		},
	});

	return (legacyClients as Array<{ id: number; fullName: string }>).map(
		(client) => ({
			id: client.id,
			value: String(client.id),
			label: client.fullName,
			isDisabled: false,
		}),
	);
}

export async function getSelectableContractEmployees(
	_firmId: number,
): Promise<QueryManyReturnType<Option>> {
	if (prisma.employeeProfile) {
		const employees = await prisma.employeeProfile.findMany({
			where: {
				deletedAt: null,
				isActive: true,
				person: { deletedAt: null, isActive: true },
			},
			orderBy: { person: { fullName: "asc" } },
			select: {
				id: true,
				personId: true,
				person: {
					select: {
						fullName: true,
					},
				},
			},
		});

		return employees.map((employee) => ({
			id: employee.id,
			value: String(employee.id),
			label: employee.person.fullName,
			isDisabled: false,
		}));
	}

	const legacyEmployees = await (
		prisma as unknown as {
			employee: { findMany: (args: unknown) => Promise<unknown[]> };
		}
	).employee.findMany({
		where: { deletedAt: null, isActive: true },
		orderBy: { fullName: "asc" },
		select: {
			id: true,
			fullName: true,
			type: { select: { label: true } },
		},
	});

	return (legacyEmployees as Array<{ id: number; fullName: string }>).map(
		(employee) => ({
			id: employee.id,
			value: String(employee.id),
			label: employee.fullName,
			isDisabled: false,
		}),
	);
}

export async function getLegalAreaByValue(value: string) {
	return prisma.legalArea.findUnique({
		where: { value },
	});
}

export async function getContractStatusByValue(value: string) {
	return prisma.contractStatus.findUnique({
		where: { value },
	});
}

export async function getAssignmentTypesByValues(values: string[]) {
	return prisma.assignmentType.findMany({
		where: { value: { in: values } },
	});
}

export async function getRevenueTypesByValues(values: string[]) {
	return prisma.revenueType.findMany({
		where: { value: { in: values } },
	});
}
