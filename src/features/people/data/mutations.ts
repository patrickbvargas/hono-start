import { buildAuditUpdateChangeData } from "@/features/audit-logs/data/mutations";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCan,
	hasPermission,
	type LoggedUserSession,
} from "@/shared/session";
import type { PersonCreateInput, PersonUpdateInput } from "../schemas/form";
import {
	personCreateInputSchema,
	personUpdateInputSchema,
} from "../schemas/form";
import { getPersonReadScope } from "./access";

async function audit(
	tx: Prisma.TransactionClient,
	session: LoggedUserSession,
	id: number,
	name: string,
	action: string,
	description: string,
	changes: unknown,
) {
	await tx.auditLog.create({
		data: {
			firmId: session.firm.id,
			personId: id,
			actorId: session.person?.id,
			actorName: session.user.fullName,
			actorEmail: session.user.email,
			entityType: "Person",
			entityId: String(id),
			entityName: name,
			action,
			description,
			changeData: JSON.parse(JSON.stringify(changes)) as Prisma.InputJsonValue,
		},
	});
}
function assertRolePermission(
	session: LoggedUserSession,
	role: "clients" | "suppliers" | "employees",
	action: "create" | "update",
) {
	assertCan(
		session,
		role === "clients"
			? action === "create"
				? "org:clients:create"
				: "org:clients:update"
			: role === "suppliers"
				? action === "create"
					? "org:suppliers:create"
					: "org:suppliers:update"
				: action === "create"
					? "org:employees:create"
					: "org:employees:update",
	);
}
async function savePerson(
	session: LoggedUserSession,
	input: PersonCreateInput | PersonUpdateInput,
) {
	const id = "id" in input ? input.id : undefined;
	assertCan(session, id ? "org:people:update" : "org:people:create");
	try {
		return await prisma.$transaction(
			async (tx) => {
				if (id) {
					await tx.$queryRaw`SELECT id FROM people WHERE id=${id} FOR UPDATE`;
				}
				const before = id
					? await tx.person.findFirst({
							where: { AND: [{ id }, getPersonReadScope(session)] },
							include: {
								personType: true,
								clientProfile: true,
								supplierProfile: true,
								employeeProfile: { include: { employeeType: true } },
							},
						})
					: null;
				if (id && (!before || before.deletedAt)) {
					throw new Error("Pessoa não encontrada ou excluída.");
				}
				if (
					(!before && input.isGeneric) ||
					(before && before.isGeneric !== input.isGeneric)
				) {
					throw new Error("Cadastros genéricos são definidos pelo seed.");
				}
				const client = input.isCustomer ?? !!before?.clientProfile?.isActive;
				const supplier =
					input.isSupplier ?? !!before?.supplierProfile?.isActive;
				const employee =
					input.isEmployee ??
					(!!before?.employeeProfile?.isActive &&
						!before.employeeProfile.deletedAt);
				for (const [role, enabled, old] of [
					["clients", client, !!before?.clientProfile?.isActive],
					["suppliers", supplier, !!before?.supplierProfile?.isActive],
					[
						"employees",
						employee,
						!!before?.employeeProfile?.isActive &&
							!before.employeeProfile.deletedAt,
					],
				] as const) {
					if (enabled !== old) {
						assertRolePermission(session, role, before ? "update" : "create");
					}
				}
				if (
					before?.employeeProfile?.isActive &&
					!employee &&
					(await tx.contractAssignment.count({
						where: {
							employeeProfileId: before.employeeProfile.id,
							isActive: true,
							deletedAt: null,
							contract: { isActive: true, deletedAt: null },
						},
					}))
				) {
					throw new Error(
						"Colaborador possui contratos ativos e não pode perder este papel.",
					);
				}
				if (employee && !supplier) {
					throw new Error("Colaborador também deve ser fornecedor.");
				}
				const professionalChanged =
					employee &&
					!!input.employeeType &&
					(!before?.employeeProfile ||
						before.employeeProfile.employeeType.value !== input.employeeType ||
						(before.employeeProfile.oabNumber ?? "") !==
							(input.employeeType === "LAWYER" ? input.oabNumber : "") ||
						Number(before.employeeProfile.remunerationPercentage) !==
							input.remunerationPercent ||
						Number(before.employeeProfile.referralPercentage) !==
							input.referrerPercent ||
						!before.employeeProfile.isActive ||
						!!before.employeeProfile.deletedAt);
				if (professionalChanged) {
					assertRolePermission(
						session,
						"employees",
						before?.employeeProfile ? "update" : "create",
					);
				}
				if (
					before?.id === session.person?.id &&
					(!input.isActive || !employee)
				) {
					throw new Error("Não é possível desativar seu próprio acesso.");
				}
				const type = input.isGeneric
					? null
					: await tx.personType.findUnique({ where: { value: input.type } });
				if (
					!input.isGeneric &&
					(!type || (!type.isActive && type.id !== before?.personTypeId))
				) {
					throw new Error("Tipo indisponível.");
				}
				const personData = {
					fullName: input.fullName,
					document: input.isGeneric ? null : input.document,
					personTypeId: type?.id ?? null,
					email: input.email || null,
					phone: input.phone || null,
					isActive: input.isActive,
				};
				const person = id
					? await tx.person.update({ where: { id }, data: personData })
					: await tx.person.create({ data: personData });
				if (client) {
					await tx.clientProfile.upsert({
						where: { personId: person.id },
						update: { isActive: true },
						create: { personId: person.id },
					});
				} else if (before?.clientProfile?.isActive) {
					await tx.clientProfile.update({
						where: { personId: person.id },
						data: { isActive: false },
					});
				}
				if (supplier) {
					await tx.supplierProfile.upsert({
						where: { personId: person.id },
						update: { isActive: true },
						create: { personId: person.id },
					});
				} else if (before?.supplierProfile?.isActive) {
					await tx.supplierProfile.update({
						where: { personId: person.id },
						data: { isActive: false },
					});
				}
				if (
					employee &&
					professionalChanged &&
					hasPermission(session, "org:employees:read") &&
					input.employeeType
				) {
					const employeeType = await tx.employeeType.findUnique({
						where: { value: input.employeeType },
					});
					if (
						!employeeType ||
						(!employeeType.isActive &&
							employeeType.id !== before?.employeeProfile?.employeeTypeId)
					) {
						throw new Error("Função indisponível.");
					}
					const data = {
						isActive: true,
						deletedAt: null,
						employeeTypeId: employeeType.id,
						oabNumber: input.employeeType === "LAWYER" ? input.oabNumber : null,
						remunerationPercentage: input.remunerationPercent,
						referralPercentage: input.referrerPercent,
					};
					await tx.employeeProfile.upsert({
						where: { personId: person.id },
						update: data,
						create: { personId: person.id, ...data },
					});
				} else if (!employee && before?.employeeProfile?.isActive) {
					await tx.employeeProfile.update({
						where: { personId: person.id },
						data: { isActive: false },
					});
				}
				await audit(
					tx,
					session,
					person.id,
					person.fullName,
					id ? "UPDATE" : "CREATE",
					`${id ? "Atualizou" : "Criou"} pessoa ${person.fullName}.`,
					before
						? buildAuditUpdateChangeData({
								before: {
									id: before.id,
									fullName: before.fullName,
									document: before.document ?? "",
									email: before.email ?? "",
									phone: before.phone ?? "",
									type: before.personType?.value ?? "",
									isActive: before.isActive,
									isGeneric: before.isGeneric,
									isCustomer: !!before.clientProfile?.isActive,
									isSupplier: !!before.supplierProfile?.isActive,
									isEmployee:
										!!before.employeeProfile?.isActive &&
										!before.employeeProfile.deletedAt,
									employeeType:
										before.employeeProfile?.employeeType.value ?? "",
									oabNumber: before.employeeProfile?.oabNumber ?? "",
									remunerationPercent: Number(
										before.employeeProfile?.remunerationPercentage ?? 0,
									),
									referrerPercent: Number(
										before.employeeProfile?.referralPercentage ?? 0,
									),
								},
								after: input,
							})
						: input,
				);
				return { success: true };
			},
			{ timeout: 20000 },
		);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw new Error("Documento ou OAB já cadastrado.");
			}
			if (error.code === "P2003") {
				throw new Error("Pessoa possui vínculos que impedem esta alteração.");
			}
		}
		if (
			error instanceof Error &&
			/outstanding obligations|requires supplier|Generic Person/.test(
				error.message,
			)
		) {
			throw new Error(
				"Existem obrigações ou vínculos que impedem a alteração dos papéis.",
			);
		}
		throw error;
	}
}
export function createPerson({
	session,
	input,
}: {
	session: LoggedUserSession;
	input: PersonCreateInput;
}) {
	return savePerson(session, personCreateInputSchema.parse(input));
}
export function updatePerson({
	session,
	input,
}: {
	session: LoggedUserSession;
	input: PersonUpdateInput;
}) {
	return savePerson(session, personUpdateInputSchema.parse(input));
}
async function lifecycle(
	session: LoggedUserSession,
	id: number,
	restore: boolean,
) {
	assertCan(session, restore ? "org:people:restore" : "org:people:delete");
	return prisma.$transaction(async (tx) => {
		await tx.$queryRaw`SELECT id FROM people WHERE id=${id} FOR UPDATE`;
		const row = await tx.person.findFirst({
			where: { AND: [{ id }, getPersonReadScope(session)] },
			include: {
				clientProfile: true,
				supplierProfile: true,
				employeeProfile: true,
			},
		});
		if (!row) {
			throw new Error("Pessoa não encontrada.");
		}
		if (row.isGeneric) {
			throw new Error("Cadastro genérico do sistema não pode ser excluído.");
		}
		if (id === session.person?.id) {
			throw new Error("Não é possível excluir seu próprio cadastro.");
		}
		if (row.supplierProfile) {
			assertCan(
				session,
				restore ? "org:suppliers:restore" : "org:suppliers:delete",
			);
		}
		if (row.employeeProfile) {
			assertCan(
				session,
				restore ? "org:employees:restore" : "org:employees:delete",
			);
		}
		if (row.clientProfile) {
			assertCan(
				session,
				restore ? "org:clients:restore" : "org:clients:delete",
			);
		}
		if (!restore) {
			const [contracts, assignments, incoming, outgoing] = await Promise.all([
				tx.contract.count({
					where: {
						customer: { personId: id },
						deletedAt: null,
						isActive: true,
					},
				}),
				tx.contractAssignment.count({
					where: {
						employeeProfile: { personId: id },
						deletedAt: null,
						isActive: true,
					},
				}),
				tx.receivable.findMany({
					where: { debtor: { personId: id }, cancelledAt: null },
					include: { receipts: { where: { reversal: null } } },
				}),
				tx.payable.findMany({
					where: { beneficiary: { personId: id }, cancelledAt: null },
					include: { payments: { where: { reversal: null } } },
				}),
			]);
			if (
				contracts ||
				assignments ||
				incoming.some((t) =>
					t.amount.gt(
						t.receipts.reduce(
							(a, r) => a.plus(r.principalAbated),
							new Prisma.Decimal(0),
						),
					),
				) ||
				outgoing.some((t) =>
					t.amount.gt(
						t.payments.reduce(
							(a, r) => a.plus(r.principalAbated),
							new Prisma.Decimal(0),
						),
					),
				)
			) {
				throw new Error(
					"Pessoa possui vínculos ativos ou saldo pendente e não pode ser excluída.",
				);
			}
		}
		await tx.person.update({
			where: { id },
			data: { deletedAt: restore ? null : new Date() },
		});
		await audit(
			tx,
			session,
			id,
			row.fullName,
			restore ? "RESTORE" : "DELETE",
			`${restore ? "Restaurou" : "Excluiu"} pessoa ${row.fullName}.`,
			{ deleted: !restore },
		);
		return { success: true };
	});
}
export function deletePerson({
	session,
	id,
}: {
	session: LoggedUserSession;
	id: number;
}) {
	return lifecycle(session, id, false);
}
export function restorePerson({
	session,
	id,
}: {
	session: LoggedUserSession;
	id: number;
}) {
	return lifecycle(session, id, true);
}
