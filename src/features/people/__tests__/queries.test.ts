import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	clerkPermissions,
	type LoggedUserSession,
} from "@/shared/session/schema";

const mocks = vi.hoisted(() => ({
	findMany: vi.fn(),
	findFirst: vi.fn(),
	count: vi.fn(),
}));
vi.mock("@/shared/lib/prisma", () => ({
	prisma: {
		person: {
			findMany: mocks.findMany,
			findFirst: mocks.findFirst,
			count: mocks.count,
		},
	},
}));

import { getPeople, getPersonById } from "../data/queries";
import { personSearchDefaults } from "../utils/default";

const session: LoggedUserSession = {
	user: { fullName: "Test", email: "test@example.com" },
	employee: { id: 8 },
	employeeProfile: { id: 8 },
	person: { id: 99 },
	employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
	firm: { id: 1, name: "Matriz" },
	permissions: ["org:clients:read", "org:contracts:read_assigned"],
	clerk: {
		userId: "user_test",
		organizationId: "org_test",
		sessionId: "sess_test",
	},
};
const fixture = {
	id: 12,
	fullName: "Shared identity",
	document: "52998224725",
	email: null,
	phone: null,
	personTypeId: 1,
	personType: { label: "Pessoa Física", value: "INDIVIDUAL" },
	isGeneric: false,
	isActive: true,
	deletedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	clientProfile: { id: 100, isActive: true, _count: { contracts: 1 } },
	supplierProfile: { id: 200, isActive: true },
	employeeProfile: {
		id: 300,
		isActive: true,
		deletedAt: null,
		employeeType: { value: "LAWYER", label: "Advogado" },
		oabNumber: "RS123456",
		remunerationPercentage: 0.3,
		referralPercentage: 0.1,
	},
};
beforeEach(() => {
	vi.clearAllMocks();
	mocks.findMany.mockResolvedValue([fixture]);
	mocks.findFirst.mockResolvedValue(fixture);
	mocks.count.mockResolvedValue(1);
});
describe("person scope and projection", () => {
	it("does not disclose additional roles/professional fields to Member", async () => {
		const result = await getPersonById({ session, id: 12 });
		expect(result.roles).toEqual(["Cliente"]);
		expect(result).not.toHaveProperty("isSupplier");
		expect(result).not.toHaveProperty("isEmployee");
		expect(result).not.toHaveProperty("professional");
		expect(mocks.findFirst.mock.calls[0][0].where.AND[1]).toEqual(
			expect.objectContaining({ OR: expect.any(Array) }),
		);
	});
	it("denies forged protected filters before counts/options", async () => {
		await expect(
			getPeople({
				session,
				search: { ...personSearchDefaults, roles: ["EMPLOYEE"] },
			}),
		).rejects.toThrow("permissão");
		expect(mocks.findMany).not.toHaveBeenCalled();
		expect(mocks.count).not.toHaveBeenCalled();
	});
	it("uses the same assigned and Firm scope for rows/counts", async () => {
		await getPeople({ session, search: personSearchDefaults });
		expect(mocks.findMany.mock.calls[0][0].where).toEqual(
			mocks.count.mock.calls[0][0].where,
		);
		expect(JSON.stringify(mocks.count.mock.calls[0][0].where)).toContain(
			'"firmId":1',
		);
		expect(JSON.stringify(mocks.count.mock.calls[0][0].where)).toContain(
			'"employeeProfileId":8',
		);
	});
	it("returns professional fields only with independent authority", async () => {
		const result = await getPersonById({
			session: { ...session, permissions: [...clerkPermissions] },
			id: 12,
		});
		expect(result.professional?.remunerationPercent).toBe(0.3);
		expect(result.roles).toEqual(["Cliente", "Fornecedor", "Colaborador"]);
	});
});
