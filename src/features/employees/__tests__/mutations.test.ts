import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmployeeType, UserRole } from "@/generated/prisma/client";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import type { EmployeeDetail } from "../schemas/model";

const {
	createAuditLogMock,
	getEmployeeByIdMock,
	getEmployeeTypeByValueMock,
	getUserRoleByValueMock,
	prismaMock,
	supabaseAdminClientMock,
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
	supabaseAdminClientMock: {
		auth: {
			admin: {
				createUser: vi.fn(),
				listUsers: vi.fn(),
				updateUserById: vi.fn(),
			},
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/shared/lib/supabase-admin", () => ({
	getSupabaseAdminClient: () => supabaseAdminClientMock,
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
	grantEmployeeAccess,
	resetEmployeePassword,
	restoreEmployee,
	revokeEmployeeAccess,
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
	isAccessEnabled: true,
	mustChangePassword: false,
	authUserId: "auth-user-1",
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
		supabaseAdminClientMock.auth.admin.createUser.mockResolvedValue({
			data: {
				user: {
					id: "auth-user-1",
				},
			},
			error: null,
		});
		supabaseAdminClientMock.auth.admin.listUsers.mockResolvedValue({
			data: {
				users: [],
				nextPage: null,
			},
			error: null,
		});
		supabaseAdminClientMock.auth.admin.updateUserById.mockResolvedValue({
			data: {
				user: {
					id: "auth-user-1",
				},
			},
			error: null,
		});
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
	});

	it("revokes access locally when the employee email changes", async () => {
		getEmployeeByIdMock.mockResolvedValue(baseEmployee());
		getEmployeeTypeByValueMock.mockResolvedValue(baseType());
		getUserRoleByValueMock.mockResolvedValue(baseRole());

		await expect(
			updateEmployee({
				actor: {
					id: 9,
					name: "Admin",
					email: "admin@example.com",
				},
				firmId: 1,
				input: {
					id: 1,
					fullName: "Maria Souza",
					email: "maria.souza@example.com",
					oabNumber: "RS123456",
					remunerationPercent: 0.4,
					referrerPercent: 0.2,
					type: "LAWYER",
					role: "USER",
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.employee.update).toHaveBeenCalledWith({
			where: {
				id: 1,
			},
			data: expect.objectContaining({
				email: "maria.souza@example.com",
				fullName: "Maria Souza",
				isAccessEnabled: false,
				mustChangePassword: true,
			}),
		});
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

	it("resets a Supabase-linked employee password without writing plaintext to audit", async () => {
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
		expect(
			supabaseAdminClientMock.auth.admin.updateUserById,
		).toHaveBeenCalledWith(
			"auth-user-1",
			expect.objectContaining({
				email: "maria@example.com",
				password: result.temporaryPassword,
			}),
		);
		expect(prismaMock.employee.update).toHaveBeenCalledWith({
			where: {
				id: 1,
			},
			data: {
				mustChangePassword: true,
			},
		});
		expect(createAuditLogMock).not.toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				changeData: expect.objectContaining({
					temporaryPassword: expect.any(String),
				}),
			}),
		);
	});

	it("grants access by linking a Supabase Auth user and setting domain flags", async () => {
		getEmployeeByIdMock.mockResolvedValue(
			baseEmployee({
				hasCredentialAccount: false,
				isAccessEnabled: false,
				mustChangePassword: false,
				authUserId: null,
			}),
		);
		supabaseAdminClientMock.auth.admin.listUsers.mockResolvedValueOnce({
			data: {
				users: [
					{
						id: "auth-user-1",
						email: "maria@example.com",
					},
				],
				nextPage: null,
			},
			error: null,
		});

		const result = await grantEmployeeAccess({
			actor: {
				id: 9,
				name: "Admin",
				email: "admin@example.com",
			},
			firmId: 1,
			id: 1,
		});

		expect(result.success).toBe(true);
		expect(
			supabaseAdminClientMock.auth.admin.updateUserById,
		).toHaveBeenCalledWith(
			"auth-user-1",
			expect.objectContaining({
				email: "maria@example.com",
				password: result.temporaryPassword,
			}),
		);
		expect(prismaMock.employee.update).toHaveBeenCalledWith({
			where: {
				id: 1,
			},
			data: {
				isAccessEnabled: true,
				mustChangePassword: true,
				authUserId: "auth-user-1",
			},
		});
	});

	it("revokes enabled access without deleting the auth identity", async () => {
		getEmployeeByIdMock.mockResolvedValue(baseEmployee());

		await expect(
			revokeEmployeeAccess({
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
				isAccessEnabled: false,
			},
		});
	});
});
