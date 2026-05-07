import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmployeeType, UserRole } from "@/generated/prisma/client";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import type { EmployeeDetail } from "../schemas/model";

const {
	createAuditLogMock,
	getEmployeeByIdMock,
	getEmployeeTypeByValueMock,
	getUserRoleByValueMock,
	hashPasswordMock,
	prismaMock,
} = vi.hoisted(() => ({
	createAuditLogMock: vi.fn(),
	getEmployeeByIdMock: vi.fn(),
	getEmployeeTypeByValueMock: vi.fn(),
	getUserRoleByValueMock: vi.fn(),
	hashPasswordMock: vi.fn(),
	prismaMock: {
		account: {
			update: vi.fn(),
		},
		employee: {
			create: vi.fn(),
			update: vi.fn(),
		},
		contractEmployee: {
			count: vi.fn(),
		},
		session: {
			deleteMany: vi.fn(),
		},
		user: {
			findFirst: vi.fn(),
			update: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/features/audit-logs/data/mutations", () => ({
	createAuditLog: createAuditLogMock,
}));

vi.mock("better-auth/crypto", () => ({
	hashPassword: hashPasswordMock,
}));

vi.mock("../data/queries", () => ({
	getEmployeeById: getEmployeeByIdMock,
	getEmployeeTypeByValue: getEmployeeTypeByValueMock,
	getUserRoleByValue: getUserRoleByValueMock,
}));

import {
	createEmployee,
	deleteEmployee,
	resetEmployeePassword,
	restoreEmployee,
	updateEmployee,
} from "../data/mutations";

const baseType = (overrides: Partial<EmployeeType> = {}): EmployeeType => ({
	id: 10,
	value: "LAWYER",
	label: "Advogado",
	isActive: true,
	...overrides,
});

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
	email: "maria@example.com",
	oabNumber: "RS123456",
	remunerationPercent: 0.4,
	referrerPercent: 0.2,
	typeId: 10,
	roleId: 20,
	type: "Advogado",
	typeValue: "LAWYER",
	role: "Usuário",
	roleValue: "USER",
	contractCount: 0,
	hasCredentialAccount: true,
	mustChangePassword: false,
	isActive: true,
	isSoftDeleted: false,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
	...overrides,
});

describe("employee lookup-backed writes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.employee.create.mockResolvedValue({});
		prismaMock.employee.update.mockResolvedValue({});
		prismaMock.account.update.mockResolvedValue({});
		prismaMock.contractEmployee.count.mockResolvedValue(0);
		prismaMock.session.deleteMany.mockResolvedValue({});
		prismaMock.user.findFirst.mockResolvedValue({
			id: "auth-user-1",
			accounts: [{ id: "credential-account-1" }],
		});
		prismaMock.user.update.mockResolvedValue({});
		hashPasswordMock.mockResolvedValue("hashed-password");
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
					email: "maria@example.com",
					oabNumber: "RS123456",
					remunerationPercent: 0.4,
					referrerPercent: 0.2,
					type: "UNKNOWN",
					role: "USER",
					isActive: true,
				},
			}),
		).rejects.toThrow(EMPLOYEE_ERRORS.TYPE_NOT_FOUND);

		expect(prismaMock.employee.create).not.toHaveBeenCalled();
	});

	it("rejects unknown roles on create", async () => {
		getEmployeeTypeByValueMock.mockResolvedValue(baseType());
		getUserRoleByValueMock.mockResolvedValue(null);

		await expect(
			createEmployee({
				firmId: 1,
				input: {
					fullName: "Maria Silva",
					email: "maria@example.com",
					oabNumber: "RS123456",
					remunerationPercent: 0.4,
					referrerPercent: 0.2,
					type: "LAWYER",
					role: "UNKNOWN",
					isActive: true,
				},
			}),
		).rejects.toThrow(EMPLOYEE_ERRORS.ROLE_NOT_FOUND);

		expect(prismaMock.employee.create).not.toHaveBeenCalled();
	});

	it("allows unchanged inactive persisted selections on update", async () => {
		getEmployeeByIdMock.mockResolvedValue(baseEmployee());
		getEmployeeTypeByValueMock.mockResolvedValue(
			baseType({ id: 10, isActive: false }),
		);
		getUserRoleByValueMock.mockResolvedValue(
			baseRole({ id: 20, isActive: false }),
		);

		await expect(
			updateEmployee({
				firmId: 1,
				input: {
					id: 1,
					fullName: "Maria Silva",
					email: "maria@example.com",
					oabNumber: "RS123456",
					remunerationPercent: 0.4,
					referrerPercent: 0.2,
					type: "LAWYER",
					role: "USER",
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.employee.update).toHaveBeenCalledOnce();
	});

	it("blocks delete when active remuneration dependencies exist", async () => {
		getEmployeeByIdMock.mockResolvedValue(baseEmployee());
		prismaMock.contractEmployee.count.mockResolvedValue(1);

		await expect(deleteEmployee({ firmId: 1, id: 1 })).rejects.toThrow(
			EMPLOYEE_ERRORS.DELETE_ACTIVE_DEPENDENCIES,
		);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
		expect(prismaMock.employee.update).not.toHaveBeenCalled();
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
			where: { id: 1 },
			data: { deletedAt: expect.any(Date) },
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				firmId: 1,
				action: "DELETE",
				entityType: "Employee",
				entityId: 1,
			}),
		);
	});

	it("restores soft-deleted employees and writes an audit log", async () => {
		getEmployeeByIdMock.mockResolvedValue(
			baseEmployee({
				isSoftDeleted: true,
				updatedAt: "2026-01-03T00:00:00.000Z",
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
			where: { id: 1 },
			data: { deletedAt: null },
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				firmId: 1,
				action: "RESTORE",
				entityType: "Employee",
				entityId: 1,
			}),
		);
	});

	it("resets an employee password, revokes sessions, and avoids storing plaintext in audit logs", async () => {
		getEmployeeByIdMock.mockResolvedValue(baseEmployee());

		const result = await resetEmployeePassword({
			actor: {
				id: 9,
				name: "Admin",
				email: "admin@example.com",
			},
			firmId: 1,
			id: 1,
		});

		expect(result.success).toBe(true);
		expect(result.temporaryPassword).toMatch(
			/^([A-Z]{4,6}-\d{4}|[A-Z0-9]{4}-[A-Z0-9]{4})$/,
		);
		expect(hashPasswordMock).toHaveBeenCalledWith(result.temporaryPassword);
		expect(prismaMock.account.update).toHaveBeenCalledWith({
			where: {
				id: "credential-account-1",
			},
			data: {
				password: "hashed-password",
			},
		});
		expect(prismaMock.user.update).toHaveBeenCalledWith({
			where: {
				id: "auth-user-1",
			},
			data: {
				mustChangePassword: true,
			},
		});
		expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
			where: {
				userId: "auth-user-1",
			},
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				changeData: {
					action: "RESET_PASSWORD",
					mustChangePassword: true,
				},
			}),
		);
		expect(createAuditLogMock).not.toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				changeData: expect.objectContaining({
					temporaryPassword: expect.any(String),
				}),
			}),
		);
	});

	it("rejects employee password reset when no credential account exists", async () => {
		getEmployeeByIdMock.mockResolvedValue(
			baseEmployee({
				hasCredentialAccount: false,
			}),
		);
		prismaMock.user.findFirst.mockResolvedValueOnce(null);

		await expect(
			resetEmployeePassword({
				firmId: 1,
				id: 1,
			}),
		).rejects.toThrow(EMPLOYEE_ERRORS.RESET_PASSWORD_UNAVAILABLE);
	});
});
