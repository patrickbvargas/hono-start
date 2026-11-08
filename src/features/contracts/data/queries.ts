import { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import type {
	QueryManyReturnType,
	QueryPaginatedReturnType,
} from "@/shared/types/api";
import { CONTRACT_ERRORS } from "../constants/errors";
import {
	type ContractDetail,
	type ContractSummary,
	contractDetailSchema,
	contractSummarySchema,
} from "../schemas/model";
import type { ContractSearch } from "../schemas/search";
import { contractSearchDefaults } from "../utils/default";

interface ContractAccessParams {
	canReadTitles?: boolean;
	firmId: number;
	employeeId?: number;
	employeeTypeValue?: string;
	isAdmin: boolean;
}
const summaryInclude = {
	customer: {
		select: {
			id: true,
			personId: true,
			person: { select: { fullName: true, document: true } },
		},
	},
	legalArea: { select: { label: true, value: true } },
	status: { select: { label: true, value: true } },
	assignments: {
		where: { deletedAt: null, isActive: true },
		orderBy: { id: "asc" },
		include: {
			employeeProfile: { include: { person: true, employeeType: true } },
			assignmentType: true,
		},
	},
	revenues: {
		where: { deletedAt: null, isActive: true },
		select: { id: true },
	},
} satisfies Prisma.ContractInclude;
const detailInclude = {
	...summaryInclude,
	assignments: {
		orderBy: { id: "asc" },
		include: {
			employeeProfile: { include: { person: true, employeeType: true } },
			assignmentType: true,
		},
	},
	revenues: {
		orderBy: { id: "asc" },
		include: {
			revenueType: true,
			contractRevenueReceivables: {
				include: {
					receivable: { include: { receipts: { where: { reversal: null } } } },
				},
			},
		},
	},
} satisfies Prisma.ContractInclude;
type SummaryRow = Prisma.ContractGetPayload<{ include: typeof summaryInclude }>;
type DetailRow = Prisma.ContractGetPayload<{ include: typeof detailInclude }>;
function assignmentSummaries(assignments: SummaryRow["assignments"]) {
	return assignments.map((a) => ({
		employeeId: a.employeeProfileId,
		employeeTypeValue: a.employeeProfile.employeeType.value,
		assignmentTypeValue: a.assignmentType.value,
	}));
}
function whereContract(
	scope: ContractAccessParams,
	search: ContractSearch,
): Prisma.ContractWhereInput {
	const types =
		scope.employeeTypeValue === "LAWYER"
			? ["RESPONSIBLE", "RECOMMENDED"]
			: scope.employeeTypeValue === "ADMIN_ASSISTANT"
				? ["ADMIN_ASSISTANT"]
				: [];
	return {
		firmId: scope.firmId,
		...getEntityActiveWhere(search.active),
		...getEntityDeletedWhere(search.status),
		...(search.query
			? {
					OR: [
						{ processNumber: { contains: search.query, mode: "insensitive" } },
						{
							customer: {
								person: {
									fullName: { contains: search.query, mode: "insensitive" },
								},
							},
						},
					],
				}
			: {}),
		...(search.clientId ? { customerId: Number(search.clientId) } : {}),
		...(search.legalArea.length
			? { legalArea: { value: { in: search.legalArea } } }
			: {}),
		...(search.contractStatus.length
			? { status: { value: { in: search.contractStatus } } }
			: {}),
		AND: [
			...(!scope.isAdmin
				? [
						{
							assignments: {
								some: {
									firmId: scope.firmId,
									employeeProfileId: scope.employeeId ?? -1,
									isActive: true,
									deletedAt: null,
									assignmentType: { value: { in: types } },
									employeeProfile: {
										employeeType: { value: scope.employeeTypeValue ?? "" },
									},
								},
							},
						},
					]
				: []),
			...(search.employeeId
				? [
						{
							assignments: {
								some: {
									firmId: scope.firmId,
									employeeProfileId: Number(search.employeeId),
									isActive: true,
									deletedAt: null,
								},
							},
						},
					]
				: []),
		],
	};
}
function mapSummary(
	scope: ContractAccessParams,
	c: SummaryRow,
): ContractSummary {
	const active = c.assignments.filter((a) => a.isActive && !a.deletedAt);
	const lawyer =
		active.find((a) => a.assignmentType.value === "RESPONSIBLE") ??
		active.find((a) => a.assignmentType.value === "RECOMMENDED");
	return contractSummarySchema.parse({
		id: c.id,
		processNumber: c.processNumber,
		clientId: c.customerId,
		clientPersonId: c.customer.personId,
		client: c.customer.person.fullName,
		clientDocument: c.customer.person.document,
		lawyer: lawyer?.employeeProfile.person.fullName ?? "—",
		legalAreaId: c.legalAreaId,
		legalArea: c.legalArea.label,
		legalAreaValue: c.legalArea.value,
		statusId: c.statusId,
		status: c.status.label,
		statusValue: c.status.value,
		feePercentage: Number(c.feePercentage),
		assignmentCount: active.length,
		revenueCount: c.revenues.length,
		assignedEmployeeIds: active.map((a) => a.employeeProfileId),
		isAssignedToActor:
			scope.isAdmin ||
			active.some((a) => a.employeeProfileId === scope.employeeId),
		isActive: c.isActive,
		isSoftDeleted: Boolean(c.deletedAt),
		createdAt: c.createdAt.toISOString(),
		updatedAt: c.updatedAt?.toISOString() ?? null,
	});
}
function mapRevenue(revenue: DetailRow["revenues"][number]) {
	const titles = revenue.contractRevenueReceivables
		.map((b) => b.receivable)
		.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime() || a.id - b.id);
	const balance = (title: (typeof titles)[number]) =>
		title.cancelledAt
			? new Prisma.Decimal(0)
			: Prisma.Decimal.max(
					0,
					title.amount.minus(
						title.receipts.reduce(
							(s, r) => s.add(r.principalAbated),
							new Prisma.Decimal(0),
						),
					),
				);
	const installments = titles.map((title, index) => ({
		id: title.id,
		kind: title.kind,
		cancelledAt: title.cancelledAt?.toISOString() ?? null,
		number: index + 1,
		dueDate: title.dueDate.toISOString().slice(0, 10),
		expectedAmount: Number(title.amount),
		receivedAmount: Number(
			title.receipts.reduce(
				(s, r) => s.add(r.effectiveAmount),
				new Prisma.Decimal(0),
			),
		),
		remainingAmount: Number(balance(title)),
		paymentDate: title.receipts.length
			? new Date(
					Math.max(...title.receipts.map((r) => r.effectiveDate.getTime())),
				).toISOString()
			: null,
	}));
	const active = titles.filter((t) => !t.cancelledAt);
	const next = installments.find(
		(t) => !t.cancelledAt && t.remainingAmount > 0,
	);
	const remaining = active.reduce(
		(s, t) => s.add(balance(t)),
		new Prisma.Decimal(0),
	);
	return {
		id: revenue.id,
		typeId: revenue.revenueTypeId,
		type: revenue.revenueType.label,
		typeValue: revenue.revenueType.value,
		totalValue: Number(revenue.negotiatedAmount),
		notes: revenue.notes,
		hasGeneratedTitles: titles.length > 0,
		downPaymentValue: Number(
			active.find((t) => t.kind === "DOWN_PAYMENT")?.amount ?? 0,
		),
		paymentStartDate:
			active[0]?.dueDate.toISOString() ?? revenue.createdAt.toISOString(),
		totalInstallments: titles.length,
		paidValue: Number(
			active.reduce(
				(s, t) =>
					s.add(
						t.receipts.reduce(
							(sum, r) => sum.add(r.effectiveAmount),
							new Prisma.Decimal(0),
						),
					),
				new Prisma.Decimal(0),
			),
		),
		installmentsPaid: active.filter((t) => balance(t).eq(0)).length,
		installments,
		nextInstallmentNumber: next?.number ?? null,
		nextDueDate: next?.dueDate ?? null,
		remainingValue: Number(remaining),
		isFullyPaid: active.length > 0 && remaining.eq(0),
		isActive: revenue.isActive,
		isSoftDeleted: Boolean(revenue.deletedAt),
	};
}
export async function getContracts({
	scope,
	search,
}: {
	scope: ContractAccessParams;
	search: ContractSearch;
}): Promise<QueryPaginatedReturnType<ContractSummary>> {
	const where = whereContract(scope, search);
	const direction = search.direction;
	const sort: Record<string, Prisma.ContractOrderByWithRelationInput> = {
		id: { id: direction },
		processNumber: { processNumber: direction },
		client: { customer: { person: { fullName: direction } } },
		legalArea: { legalArea: { label: direction } },
		status: { status: { label: direction } },
		feePercentage: { feePercentage: direction },
		isActive: { isActive: direction },
		createdAt: { createdAt: direction },
	};
	const [rows, total] = await Promise.all([
		prisma.contract.findMany({
			where,
			include: summaryInclude,
			orderBy: [sort[search.column] ?? { createdAt: "desc" }, { id: "asc" }],
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.contract.count({ where }),
	]);
	return {
		data: rows.map((c) => mapSummary(scope, c)),
		total,
		page: search.page,
		pageSize: search.limit,
	};
}
export async function getContractById({
	scope,
	id,
}: {
	scope: ContractAccessParams;
	id: number;
}): Promise<ContractDetail> {
	const contract = await prisma.contract.findFirst({
		where: {
			...whereContract(scope, { ...contractSearchDefaults, status: "all" }),
			id,
		},
		include: detailInclude,
	});
	if (!contract) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_DETAIL_NOT_FOUND);
	}
	return contractDetailSchema.parse({
		...mapSummary(scope, contract),
		notes: contract.notes,
		allowStatusChange: contract.allowStatusChange,
		assignments: contract.assignments.map((a) => ({
			id: a.id,
			employeeId: a.employeeProfileId,
			employeePersonId: a.employeeProfile.personId,
			employeeName: a.employeeProfile.person.fullName,
			employeeType: a.employeeProfile.employeeType.label,
			employeeTypeValue: a.employeeProfile.employeeType.value,
			assignmentType: a.assignmentType.label,
			assignmentTypeValue: a.assignmentType.value,
			isActive: a.isActive,
			isSoftDeleted: Boolean(a.deletedAt),
		})),
		revenues: contract.revenues.map((row) => {
			const revenue = mapRevenue(row);
			return scope.canReadTitles === false
				? {
						...revenue,
						paidValue: 0,
						remainingValue: 0,
						downPaymentValue: null,
						installments: [],
						installmentsPaid: 0,
						totalInstallments: 0,
						nextInstallmentNumber: null,
						nextDueDate: null,
						isFullyPaid: false,
					}
				: revenue;
		}),
	});
}
export async function getContractAccessResourceById(id: number) {
	const c = await prisma.contract.findFirst({
		where: { id },
		include: summaryInclude,
	});
	if (!c) {
		return null;
	}
	return {
		id: c.id,
		deletedAt: c.deletedAt,
		resource: {
			firmId: c.firmId,
			statusValue: c.status.value,
			allowStatusChange: c.allowStatusChange,
			assignments: assignmentSummaries(c.assignments),
			assignedEmployeeIds: c.assignments.map((a) => a.employeeProfileId),
		},
		hasActiveRevenues: c.revenues.length > 0,
	};
}
export async function getContractLegalAreas(): Promise<
	QueryManyReturnType<Option>
> {
	return optionSchema
		.array()
		.parse(await prisma.legalArea.findMany({ orderBy: { label: "asc" } }));
}
export async function getContractStatuses(): Promise<
	QueryManyReturnType<Option>
> {
	return optionSchema
		.array()
		.parse(await prisma.contractStatus.findMany({ orderBy: { label: "asc" } }));
}
export async function getContractAssignmentTypes(): Promise<
	QueryManyReturnType<Option>
> {
	return optionSchema
		.array()
		.parse(await prisma.assignmentType.findMany({ orderBy: { label: "asc" } }));
}
export async function getContractRevenueTypes(): Promise<
	QueryManyReturnType<Option>
> {
	return optionSchema
		.array()
		.parse(await prisma.revenueType.findMany({ orderBy: { label: "asc" } }));
}
export async function getSelectableContractClients(
	_firmId: number,
	contractWhere?: Prisma.ContractWhereInput,
): Promise<QueryManyReturnType<Option>> {
	const rows = await prisma.clientProfile.findMany({
		where: {
			isActive: true,
			person: { deletedAt: null, isActive: true },
			...(contractWhere ? { contracts: { some: contractWhere } } : {}),
		},
		orderBy: [{ person: { fullName: "asc" } }, { id: "asc" }],
		select: { id: true, person: { select: { fullName: true } } },
	});
	return rows.map((r) => ({
		id: r.id,
		value: String(r.id),
		label: r.person.fullName,
		isDisabled: false,
	}));
}
export async function getSelectableContractEmployees(
	_firmId: number,
	contractWhere?: Prisma.ContractWhereInput,
): Promise<QueryManyReturnType<Option>> {
	const rows = await prisma.employeeProfile.findMany({
		where: {
			isActive: true,
			deletedAt: null,
			person: { deletedAt: null, isActive: true },
			...(contractWhere
				? {
						assignments: {
							some: {
								contract: contractWhere,
								isActive: true,
								deletedAt: null,
							},
						},
					}
				: {}),
		},
		orderBy: [{ person: { fullName: "asc" } }, { id: "asc" }],
		select: { id: true, person: { select: { fullName: true } } },
	});
	return rows.map((r) => ({
		id: r.id,
		value: String(r.id),
		label: r.person.fullName,
		isDisabled: false,
	}));
}
export async function getLegalAreaByValue(value: string) {
	return prisma.legalArea.findUnique({ where: { value } });
}
export async function getContractStatusByValue(value: string) {
	return prisma.contractStatus.findUnique({ where: { value } });
}
export async function getAssignmentTypesByValues(values: string[]) {
	return prisma.assignmentType.findMany({ where: { value: { in: values } } });
}
export async function getRevenueTypesByValues(values: string[]) {
	return prisma.revenueType.findMany({ where: { value: { in: values } } });
}
