import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRole } from "@/generated/prisma/client";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import type { EmployeeDetail } from "../schemas/model";

const {
	createAuditLogMock,
	getEmployeeByIdMock,
	getEmployeeTypeByValueMock,
	getUserRoleByValueMock,
	prismaMock,
} = vi.hoisted(() => ({
	createAuditLogMock: vi.fn(),
	getEmployeeByIdMock: vi.fn(),
	getEmployeeTypeByValueMock: vi.fn(),
	getUserRoleByValueMock: vi.fn(),
	prismaMock: {
		employee: {
			create: vi.fn(),
			update: vi.fn(),
		},
		contractEmployee: {
			count: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/features/audit-logs/data/mutations", () => ({
	createAuditLog: createAuditLogMock,
	buildAuditUpdateChangeData: ({
		before,
		after,
	}: {
		before: unknown;
		after: unknown;
	}) => ({
		before,
		after,
	}),
}));

vi.mock("../data/queries", () => ({
	getEmployeeById: getEmployeeByIdMock,
	getEmployeeTypeByValue: getEmployeeTypeByValueMock,
	getUserRoleByValue: getUserRoleByValueMock,
}));

import {
	createEmployee,
	deleteEmployee,
	restoreEmployee,
} from "../data/mutations";

const baseRole = (overrides: Partial<UserRole> = {}): UserRole => ({
	id: 20,
	value: "USER",
	label: "Usuário",
	isActive: true,
	...overrides,
});

const baseEmployee = (
	overrides: Partial<EmployeeDetail> = {},
): EmployeeDetail => ({
	id: 1,
	fullName: "Maria Silva",
	oabNumber: "RS123456",
	remunerationPercent: 0.4,
	referrerPercent: 0.2,
	typeId: 10,
	type: "Advogado",
	typeValue: "LAWYER",
	contractCount: 0,
	isActive: true,
	isSoftDeleted: false,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
	...overrides,
});

describe("employee lookup-backed writes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.employee.create.mockResolvedValue({
			id: 1,
			fullName: "Maria Silva",
		});
		prismaMock.employee.update.mockResolvedValue({});
		prismaMock.contractEmployee.count.mockResolvedValue(0);
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(prismaMock),
		);
	});

	it("rejects unknown employee types on create", async () => {
		getEmployeeTypeByValueMock.mockResolvedValue(null);
		getUserRoleByValueMock.mockResolvedValue(baseRole());

		await expect(
			createEmployee({
				firmId: 1,
				input: {
					fullName: "Maria Silva",
					oabNumber: "RS123456",
					remunerationPercent: 0.4,
					referrerPercent: 0.2,
					type: "UNKNOWN",
					isActive: true,
				},
			}),
		).rejects.toThrow(EMPLOYEE_ERRORS.TYPE_NOT_FOUND);
	});

	it("soft-deletes active employees and writes an audit log", async () => {
		getEmployeeByIdMock.mockResolvedValue(baseEmployee());

		await expect(
			deleteEmployee({
				actor: {
					id: 9,
					name: "Admin",
					email: "admin@example.com",
				},
				firmId: 1,
				id: 1,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.employee.update).toHaveBeenCalledWith({
			where: {
				id: 1,
			},
			data: {
				deletedAt: expect.any(Date),
			},
		});
	});

	it("restores soft-deleted employees and writes an audit log", async () => {
		getEmployeeByIdMock.mockResolvedValue(
			baseEmployee({
				isSoftDeleted: true,
			}),
		);

		await expect(
			restoreEmployee({
				actor: {
					id: 9,
					name: "Admin",
					email: "admin@example.com",
				},
				firmId: 1,
				id: 1,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.employee.update).toHaveBeenCalledWith({
			where: {
				id: 1,
			},
			data: {
				deletedAt: null,
			},
		});
	});
});
