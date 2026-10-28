import { beforeEach, expect, it, vi } from "vitest";
import type { LoggedUserSession } from "@/shared/session";
import { getAuditAccessWhere } from "../data/access";

const db = vi.hoisted(() => ({
	contract: { findMany: vi.fn() },
	fee: { findMany: vi.fn() },
	remuneration: { findMany: vi.fn() },
}));
vi.mock("@/shared/lib/prisma", () => ({ prisma: db }));

function member(
	permissions: LoggedUserSession["permissions"] = [],
): LoggedUserSession {
	return {
		permissions: ["org:audit_logs:read", ...permissions],
		clerk: { userId: "member", organizationId: "org", sessionId: "session" },
		user: { fullName: "Member", email: "member@example.com" },
		employee: { id: 10 },
		firm: { id: 2, name: "Filial" },
		employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	db.contract.findMany.mockResolvedValue([{ id: 7 }]);
	db.fee.findMany.mockResolvedValue([{ id: 8 }]);
	db.remuneration.findMany.mockResolvedValue([{ id: 9 }]);
});

it("denies audit access without its explicit grant", async () => {
	await expect(
		getAuditAccessWhere({
			...member(),
			permissions: ["org:contracts:read_all"],
		}),
	).rejects.toThrow("Você não tem permissão");
	expect(db.contract.findMany).not.toHaveBeenCalled();
});

it("audit permission alone exposes no subject, even to an event author", async () => {
	expect(await getAuditAccessWhere(member())).toEqual({
		OR: [{ firmId: 2, clientId: null, employeeId: null, OR: [] }],
	});
});

it("limits a member to active permitted assignments, assigned fees and own remuneration", async () => {
	const where = await getAuditAccessWhere(
		member([
			"org:clients:read",
			"org:contracts:read_assigned",
			"org:fees:read_assigned",
			"org:remunerations:read_own",
		]),
	);
	const contractScope = {
		firmId: 2,
		assignments: {
			some: {
				firmId: 2,
				employeeId: 10,
				isActive: true,
				deletedAt: null,
				assignmentType: { value: { in: ["RESPONSIBLE", "RECOMMENDED"] } },
			},
		},
	};
	expect(db.contract.findMany).toHaveBeenCalledWith({
		where: contractScope,
		select: { id: true },
	});
	expect(db.fee.findMany).toHaveBeenCalledWith({
		where: { firmId: 2, revenue: { firmId: 2, contract: contractScope } },
		select: { id: true },
	});
	expect(db.remuneration.findMany).toHaveBeenCalledWith({
		where: { firmId: 2, contractEmployee: { firmId: 2, employeeId: 10 } },
		select: { id: true },
	});
	expect(where.OR).toEqual([
		{ clientId: { not: null } },
		{
			firmId: 2,
			clientId: null,
			employeeId: null,
			OR: expect.arrayContaining([
				{ entityType: "Contract", entityId: { in: ["7"] } },
				{ entityType: "Fee", entityId: { in: ["8"] } },
				{ entityType: "Remuneration", entityId: { in: ["9"] } },
			]),
		},
	]);
	const branches = where.OR?.[1].OR ?? [];
	expect(branches).not.toContainEqual({ entityType: "Expense" });
	expect(branches).not.toContainEqual({ entityType: "Employee" });
	expect(JSON.stringify(where)).not.toContain("actorId");
});

it("retains administrative-assistant assignment rules and follows assignment revocation", async () => {
	db.contract.findMany.mockResolvedValue([]);
	const session = member(["org:contracts:read_assigned"]);
	session.employeeType = {
		id: 2,
		value: "ADMIN_ASSISTANT",
		label: "Assistente",
	};
	const where = await getAuditAccessWhere(session);
	expect(db.contract.findMany).toHaveBeenCalledWith(
		expect.objectContaining({
			where: expect.objectContaining({
				assignments: {
					some: expect.objectContaining({
						assignmentType: { value: { in: ["ADMIN_ASSISTANT"] } },
					}),
				},
			}),
		}),
	);
	expect(where.OR?.[0].OR).toContainEqual({
		entityType: "Contract",
		entityId: { in: [] },
	});
});

it("does not grant assigned or own history without an employee binding", async () => {
	const session = member([
		"org:contracts:read_assigned",
		"org:fees:read_assigned",
		"org:remunerations:read_own",
	]);
	session.employee.id = null;
	expect(await getAuditAccessWhere(session)).toEqual({
		OR: [{ firmId: 2, clientId: null, employeeId: null, OR: [] }],
	});
	expect(db.contract.findMany).not.toHaveBeenCalled();
	expect(db.fee.findMany).not.toHaveBeenCalled();
	expect(db.remuneration.findMany).not.toHaveBeenCalled();
});

it("keeps broad subject grants independent and operational events within current firm", async () => {
	const where = await getAuditAccessWhere(
		member([
			"org:employees:read",
			"org:contracts:read_all",
			"org:fees:read_all",
			"org:remunerations:read_all",
			"org:expenses:read",
		]),
	);
	expect(where.OR?.[0]).toEqual({ employeeId: { not: null } });
	expect(where.OR?.[1]).toEqual(
		expect.objectContaining({
			firmId: 2,
			clientId: null,
			employeeId: null,
			OR: expect.arrayContaining([
				{ entityType: "Contract" },
				{ entityType: "Fee" },
				{ entityType: "Remuneration" },
				{ entityType: "Expense" },
			]),
		}),
	);
	expect(db.contract.findMany).not.toHaveBeenCalled();
});

it("authorizes both uploaded and deleted attachment events through the readable owner", async () => {
	const where = await getAuditAccessWhere(
		member(["org:contracts:read_assigned"]),
	);
	expect(where.OR?.[0].OR).toContainEqual({
		entityType: "Attachment",
		OR: [
			{
				AND: [
					{ changeData: { path: ["ownerKind"], equals: "contract" } },
					{ changeData: { path: ["ownerId"], equals: 7 } },
				],
			},
			{ changeData: { path: ["before", "contractId"], equals: 7 } },
		],
	});
});
