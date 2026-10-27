import { beforeEach, describe, expect, it, vi } from "vitest";
import { EMPLOYEE_ERRORS } from "../constants/errors";

const { getEmployeeClerkAccessMock, prismaMock } = vi.hoisted(() => ({
	getEmployeeClerkAccessMock: vi.fn(),
	prismaMock: {
		firm: {
			findUniqueOrThrow: vi.fn().mockResolvedValue({}),
		},
		employee: {
			count: vi.fn(),
			findFirst: vi.fn(),
			findMany: vi.fn(),
		},
		employeeType: {
			findMany: vi.fn(),
		},
		userRole: {
			findMany: vi.fn(),
		},
		$queryRaw: vi.fn(),
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("../data/clerk-access", () => ({
	getEmployeeClerkAccess: getEmployeeClerkAccessMock,
	getAssignableClerkRoles: async () => [{ key: "org:custom", name: "Custom" }],
}));
vi.mock("@/shared/session/server", () => ({
	getRequiredServerLoggedUserSession: async () => ({
		clerk: { organizationId: "org_firm" },
	}),
}));
vi.mock("@clerk/tanstack-react-start/server", () => ({
	clerkClient: () => ({
		users: {
			getUser: async () => ({
				primaryEmailAddressId: "email_one",
				emailAddresses: [
					{ id: "email_one", emailAddress: "maria@example.com" },
				],
			}),
		},
		organizations: {
			getOrganizationMembershipList: async () => ({
				totalCount: 1,
			}),
		},
	}),
}));

import {
	getEmployeeById,
	getEmployees,
	getEmployeeTypes,
} from "../data/queries";

describe("employee data queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.employeeType.findMany.mockResolvedValue([{ id: 2 }]);
		prismaMock.userRole.findMany.mockResolvedValue([{ id: 3 }]);
		prismaMock.employee.count.mockResolvedValue(1);
		prismaMock.employee.findMany.mockResolvedValue([
			{
				id: 10,
				fullName: "Maria Silva",
				oabNumber: "RS123456",
				remunerationPercentage: "0.3",
				type: { label: "Advogado", value: "LAWYER", id: 2, isActive: true },
				isActive: true,
				deletedAt: null,
			},
		]);
		prismaMock.$queryRaw.mockResolvedValue([{ employeeId: 10, total: 2 }]);
		getEmployeeClerkAccessMock.mockResolvedValue({
			isAccessActive: true,
			status: "ACTIVE",
			user: {
				id: "11111111-1111-1111-1111-111111111111",
			},
		});
		prismaMock.employee.findFirst.mockResolvedValue({
			id: 10,
			fullName: "Maria Silva",
			email: "maria@example.com",
			oabNumber: "RS123456",
			remunerationPercentage: "0.3",
			referralPercentage: "0.1",
			typeId: 2,
			type: { label: "Advogado", value: "LAWYER" },
			isActive: true,
			deletedAt: null,
			createdAt: new Date("2026-01-01T00:00:00.000Z"),
			updatedAt: new Date("2026-01-02T00:00:00.000Z"),
		});
	});

	it("applies search filters, deterministic sorting, and active contract counts", async () => {
		const result = await getEmployees({
			firmId: 1,
			search: {
				page: 2,
				limit: 10,
				column: "fullName",
				direction: "desc",
				query: "maria",
				type: ["LAWYER"],
				active: "true",
				status: "active",
			},
		});

		expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					deletedAt: null,
					isActive: true,
					OR: [
						{
							fullName: {
								contains: "maria",
								mode: "insensitive",
							},
						},
						{
							oabNumber: {
								contains: "maria",
								mode: "insensitive",
							},
						},
					],
					typeId: { in: [2] },
				},
				orderBy: [{ fullName: "desc" }, { id: "asc" }],
				skip: 10,
				take: 10,
			}),
		);
		expect(result.data).toEqual([
			expect.objectContaining({
				id: 10,
				contractCount: 2,
			}),
		]);
	});

	it("maps employee detail with lookup values and rejects unknown records safely", async () => {
		await expect(getEmployeeById({ firmId: 1, id: 10 })).resolves.toEqual(
			expect.objectContaining({
				id: 10,
				typeValue: "LAWYER",
				contractCount: 2,
			}),
		);

		prismaMock.employee.findFirst.mockResolvedValue(null);

		await expect(getEmployeeById({ firmId: 1, id: 999 })).rejects.toThrow(
			EMPLOYEE_ERRORS.NOT_FOUND,
		);
	});

	it("returns employee type and role options ordered by label", async () => {
		prismaMock.employeeType.findMany.mockResolvedValue([
			{ id: 2, value: "LAWYER", label: "Advogado", isActive: true },
		]);
		prismaMock.userRole.findMany.mockResolvedValue([
			{ id: 3, value: "ADMIN", label: "Administrador", isActive: true },
		]);

		await expect(getEmployeeTypes()).resolves.toEqual([
			{ id: 2, value: "LAWYER", label: "Advogado", isDisabled: false },
		]);
		expect(prismaMock.employeeType.findMany).toHaveBeenCalledWith({
			orderBy: { label: "asc" },
		});
		expect(prismaMock.userRole.findMany).not.toHaveBeenCalled();
	});
});
