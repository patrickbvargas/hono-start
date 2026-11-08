import { beforeEach, expect, it, vi } from "vitest";
import type { LoggedUserSession } from "@/shared/session";

const db = vi.hoisted(() => ({
	contract: { findMany: vi.fn() },
	receivable: { findMany: vi.fn() },
	payable: { findMany: vi.fn() },
}));
vi.mock("@/shared/lib/prisma", () => ({ prisma: db }));
vi.mock("@/features/people", () => ({
	getPersonReadWhere: () => ({ id: -1 }),
}));

import { getAuditAccessWhere } from "../data/access";

function member(
	permissions: LoggedUserSession["permissions"] = [],
): LoggedUserSession {
	return {
		permissions: ["org:audit_logs:read", ...permissions],
		clerk: { userId: "m", organizationId: "o", sessionId: "s" },
		user: { fullName: "Member", email: "m@example.com" },
		person: { id: 12 },
		employee: { id: 10 },
		firm: { id: 2, name: "Filial" },
		employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
	};
}
beforeEach(() => {
	vi.clearAllMocks();
	db.contract.findMany.mockResolvedValue([{ id: 7 }]);
	db.receivable.findMany.mockResolvedValue([{ id: 8 }]);
	db.payable.findMany.mockResolvedValue([{ id: 9 }]);
});
it("requires the audit grant independently", async () => {
	await expect(
		getAuditAccessWhere({
			...member(),
			permissions: ["org:contracts:read_all"],
		}),
	).rejects.toThrow("Você não tem permissão");
	expect(db.contract.findMany).not.toHaveBeenCalled();
});
it("audit alone grants no operational or financial subject", async () => {
	const where = await getAuditAccessWhere(member());
	expect(where.OR).toContainEqual({ firmId: 2, personId: null, OR: [] });
	expect(db.receivable.findMany).not.toHaveBeenCalled();
	expect(db.payable.findMany).not.toHaveBeenCalled();
	expect(JSON.stringify(where)).not.toContain("actorId");
});
it("scopes assigned titles and strictly own remuneration before selecting events", async () => {
	const where = await getAuditAccessWhere(
		member([
			"org:contracts:read_assigned",
			"org:receivables:read_assigned",
			"org:payables:read_own",
		]),
	);
	expect(db.contract.findMany).toHaveBeenCalledWith(
		expect.objectContaining({
			where: expect.objectContaining({
				firmId: 2,
				assignments: {
					some: expect.objectContaining({
						employeeProfileId: 10,
						isActive: true,
						deletedAt: null,
					}),
				},
			}),
		}),
	);
	expect(db.receivable.findMany).toHaveBeenCalledWith(
		expect.objectContaining({
			where: expect.objectContaining({
				firmId: 2,
				contractRevenueReceivable: expect.any(Object),
			}),
		}),
	);
	expect(db.payable.findMany).toHaveBeenCalledWith(
		expect.objectContaining({
			where: expect.objectContaining({
				firmId: 2,
				beneficiary: { personId: 12 },
				remunerationPayable: expect.any(Object),
			}),
		}),
	);
	expect(where.OR).toContainEqual({
		firmId: 2,
		entityType: "Receivable",
		entityId: { in: ["8"] },
	});
	expect(where.OR).toContainEqual({
		firmId: 2,
		entityType: "Payable",
		entityId: { in: ["9"] },
	});
});
it("denies assigned reads after employee binding is lost", async () => {
	const session = member([
		"org:contracts:read_assigned",
		"org:receivables:read_assigned",
		"org:payables:read_own",
	]);
	session.employee.id = null;
	await getAuditAccessWhere(session);
	expect(db.contract.findMany).not.toHaveBeenCalled();
	expect(db.receivable.findMany).not.toHaveBeenCalled();
	expect(db.payable.findMany).not.toHaveBeenCalled();
});
it("retains assistant assignment restrictions and attachment deletion snapshots", async () => {
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
	expect(JSON.stringify(where)).toContain('"before","contractId"');
});
it("keeps broad financial grants branch scoped and protects mixed profile history", async () => {
	const where = await getAuditAccessWhere(
		member([
			"org:contracts:read_all",
			"org:receivables:read_all",
			"org:payables:read_all",
			"org:expenses:read",
		]),
	);
	expect(db.receivable.findMany).toHaveBeenCalledWith({
		where: { firmId: 2 },
		select: { id: true },
	});
	expect(db.payable.findMany).toHaveBeenCalledWith({
		where: { firmId: 2 },
		select: { id: true },
	});
	expect(JSON.stringify(where)).toContain('"employeeProfile":{"is":null}');
});
