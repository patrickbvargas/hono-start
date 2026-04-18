import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmployeeType, UserRole } from "@/generated/prisma/client";
import { EMPLOYEE_ERRORS } from "../constants/errors";
import type { EmployeeDetail } from "../schemas/model";

const {
	getEmployeeByIdMock,
	getEmployeeTypeByValueMock,
	getUserRoleByValueMock,
	prismaMock,
} = vi.hoisted(() => ({
	getEmployeeByIdMock: vi.fn(),
	getEmployeeTypeByValueMock: vi.fn(),
	getUserRoleByValueMock: vi.fn(),
	prismaMock: {
		employee: {
			create: vi.fn(),
			update: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("../data/queries", () => ({
	getEmployeeById: getEmployeeByIdMock,
	getEmployeeTypeByValue: getEmployeeTypeByValueMock,
	getUserRoleByValue: getUserRoleByValueMock,
}));

import { createEmployee, updateEmployee } from "../data/mutations";

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
});
