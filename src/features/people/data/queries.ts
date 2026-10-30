import { Prisma } from "@/generated/prisma/client";
import {
	getEntityActiveWhere,
	getEntityDeletedWhere,
} from "@/shared/lib/entity-management";
import { prisma } from "@/shared/lib/prisma";
import { optionSchema } from "@/shared/schemas/option";
import { hasPermission, type LoggedUserSession } from "@/shared/session";
import {
	personDetailSchema,
	personFinanceSchema,
	personSummarySchema,
} from "../schemas/model";
import type { PersonSearch } from "../schemas/search";
import {
	assertPersonDirectoryRead,
	getPersonContractScope,
	getPersonReadScope,
} from "./access";

export async function getPeople({
	session,
	search,
}: {
	session: LoggedUserSession;
	search: PersonSearch;
}) {
	assertPersonDirectoryRead(session);
	const professional = hasPermission(session, "org:employees:read");
	const supplier = hasPermission(session, "org:suppliers:read");
	if (
		(!professional &&
			(search.employeeType.length || search.roles.includes("EMPLOYEE"))) ||
		(!supplier && search.roles.includes("SUPPLIER"))
	) {
		throw new Error("Você não tem permissão para este filtro.");
	}
	const AND: Prisma.PersonWhereInput[] = [
		getPersonReadScope(session),
		getEntityActiveWhere(search.active),
		getEntityDeletedWhere(search.status),
	];
	if (search.type.length) {
		AND.push({ personType: { value: { in: search.type } } });
	}
	if (search.query) {
		AND.push({
			OR: [
				{ fullName: { contains: search.query, mode: "insensitive" } },
				{
					document: {
						contains: search.query.replace(/[^0-9]/g, "") || search.query,
					},
				},
				...(professional
					? [
							{
								employeeProfile: {
									is: {
										oabNumber: {
											contains: search.query,
											mode: "insensitive" as const,
										},
									},
								},
							},
						]
					: []),
			],
		});
	}
	if (search.employeeType.length) {
		AND.push({
			employeeProfile: {
				is: {
					isActive: true,
					deletedAt: null,
					employeeType: { value: { in: search.employeeType } },
				},
			},
		});
	}
	if (search.roles.length) {
		AND.push({
			OR: search.roles.map((role) =>
				role === "CLIENT"
					? { clientProfile: { is: { isActive: true } } }
					: role === "SUPPLIER"
						? { supplierProfile: { is: { isActive: true } } }
						: { employeeProfile: { is: { isActive: true, deletedAt: null } } },
			),
		});
	}
	const where = { AND };
	const sort: Record<string, Prisma.PersonOrderByWithRelationInput> = {
		id: { id: search.direction },
		fullName: { fullName: search.direction },
		document: { document: search.direction },
		type: { personType: { label: search.direction } },
		isActive: { isActive: search.direction },
	};
	const [rows, total] = await Promise.all([
		prisma.person.findMany({
			where,
			select: personSelect(session),
			orderBy: [sort[search.column] ?? { fullName: "asc" }, { id: "asc" }],
			skip: (search.page - 1) * search.limit,
			take: search.limit,
		}),
		prisma.person.count({ where }),
	]);
	return {
		data: personSummarySchema
			.array()
			.parse(rows.map((row) => mapPerson(row, session))),
		total,
		page: search.page,
		pageSize: search.limit,
	};
}
function personSelect(session: LoggedUserSession) {
	return {
		id: true,
		fullName: true,
		document: true,
		email: true,
		phone: true,
		personTypeId: true,
		personType: true,
		isGeneric: true,
		isActive: true,
		deletedAt: true,
		createdAt: true,
		updatedAt: true,
		clientProfile: {
			select: {
				id: true,
				isActive: true,
				_count: {
					select: { contracts: { where: getPersonContractScope(session) } },
				},
			},
		},
		supplierProfile: { select: { id: true, isActive: true } },
		employeeProfile: { include: { employeeType: true as const } },
	} satisfies Prisma.PersonSelect;
}
type PersonRow = Prisma.PersonGetPayload<{
	select: ReturnType<typeof personSelect>;
}>;
function mapPerson(row: PersonRow, session: LoggedUserSession) {
	const employee = hasPermission(session, "org:employees:read")
		? row.employeeProfile
		: null;
	const isEmployee = !!employee?.isActive && !employee.deletedAt;
	return {
		id: row.id,
		fullName: row.fullName,
		document: row.document ?? "",
		email: row.email,
		phone: row.phone,
		typeId: row.personTypeId,
		type: row.personType?.label ?? "Genérica",
		typeValue: row.personType?.value ?? "",
		isGeneric: row.isGeneric,
		isActive: row.isActive,
		isSoftDeleted: !!row.deletedAt,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
		contractCount: row.clientProfile?._count.contracts ?? 0,
		...(hasPermission(session, "org:clients:read")
			? { isCustomer: !!row.clientProfile?.isActive }
			: {}),
		...(hasPermission(session, "org:suppliers:read")
			? { isSupplier: !!row.supplierProfile?.isActive }
			: {}),
		...(hasPermission(session, "org:employees:read")
			? {
					isEmployee,
					...(employee && !employee.deletedAt
						? {
								professional: {
									type: employee.employeeType.value,
									typeLabel: employee.employeeType.label,
									oabNumber: employee.oabNumber,
									remunerationPercent: Number(employee.remunerationPercentage),
									referrerPercent: Number(employee.referralPercentage),
								},
							}
						: {}),
				}
			: {}),
		roles: [
			...(hasPermission(session, "org:clients:read") &&
			row.clientProfile?.isActive
				? ["Cliente"]
				: []),
			...(hasPermission(session, "org:suppliers:read") &&
			row.supplierProfile?.isActive
				? ["Fornecedor"]
				: []),
			...(isEmployee ? ["Colaborador"] : []),
		],
	};
}
export async function getPersonById({
	session,
	id,
}: {
	session: LoggedUserSession;
	id: number;
}) {
	assertPersonDirectoryRead(session);
	const row = await prisma.person.findFirst({
		where: { AND: [{ id }, getPersonReadScope(session)] },
		select: personSelect(session),
	});
	if (!row) {
		throw new Error("Pessoa não encontrada.");
	}
	return personDetailSchema.parse(mapPerson(row, session));
}
export async function getPersonTypes() {
	return optionSchema
		.array()
		.parse(await prisma.personType.findMany({ orderBy: { label: "asc" } }));
}
export async function getEmployeeTypes() {
	return optionSchema
		.array()
		.parse(await prisma.employeeType.findMany({ orderBy: { label: "asc" } }));
}
export async function getPersonFinance({
	session,
	id,
}: {
	session: LoggedUserSession;
	id: number;
}) {
	await getPersonById({ session, id });
	const incoming =
		hasPermission(session, "org:receivables:read_all") &&
		hasPermission(session, "org:receipts:read_all");
	const outgoing =
		hasPermission(session, "org:payables:read_all") &&
		hasPermission(session, "org:payments:read_all");
	if (!incoming && !outgoing) {
		throw new Error("Você não tem permissão para esta operação.");
	}
	const [receivables, payables] = await Promise.all([
		incoming
			? prisma.receivable.findMany({
					where: {
						firmId: session.firm.id,
						debtor: { personId: id },
						cancelledAt: null,
					},
					include: { receipts: { where: { reversal: null } } },
				})
			: [],
		outgoing
			? prisma.payable.findMany({
					where: {
						firmId: session.firm.id,
						beneficiary: { personId: id },
						cancelledAt: null,
					},
					include: { payments: { where: { reversal: null } } },
				})
			: [],
	]);
	const sum = (values: Prisma.Decimal[]) =>
		values.reduce((a, b) => a.plus(b), new Prisma.Decimal(0));
	return personFinanceSchema.parse({
		contractCount: await prisma.contract.count({
			where: { ...getPersonContractScope(session), customer: { personId: id } },
		}),
		totalValue: Number(sum(receivables.map((r) => r.amount))),
		paidValue: Number(
			sum(receivables.flatMap((r) => r.receipts.map((x) => x.effectiveAmount))),
		),
		remainingValue: Number(
			sum(
				receivables.map((r) =>
					r.amount.minus(sum(r.receipts.map((x) => x.principalAbated))),
				),
			),
		),
		payableValue: Number(sum(payables.map((r) => r.amount))),
		paidOutValue: Number(
			sum(payables.flatMap((r) => r.payments.map((x) => x.effectiveAmount))),
		),
		payableBalance: Number(
			sum(
				payables.map((r) =>
					r.amount.minus(sum(r.payments.map((x) => x.principalAbated))),
				),
			),
		),
	});
}
