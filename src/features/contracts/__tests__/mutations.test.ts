import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONTRACT_ERRORS } from "../constants/errors";

const {
	createAuditLogMock,
	getAssignmentTypesByValuesMock,
	getContractAccessResourceByIdMock,
	getContractByIdMock,
	getContractStatusByValueMock,
	getLegalAreaByValueMock,
	getRevenueTypesByValuesMock,
	prismaMock,
} = vi.hoisted(() => ({
	createAuditLogMock: vi.fn(),
	getAssignmentTypesByValuesMock: vi.fn(),
	getContractAccessResourceByIdMock: vi.fn(),
	getContractByIdMock: vi.fn(),
	getContractStatusByValueMock: vi.fn(),
	getLegalAreaByValueMock: vi.fn(),
	getRevenueTypesByValuesMock: vi.fn(),
	prismaMock: {
		client: {
			findFirst: vi.fn(),
		},
		employee: {
			findMany: vi.fn(),
		},
		contract: {
			create: vi.fn(),
			findFirst: vi.fn(),
			update: vi.fn(),
		},
		contractEmployee: {
			create: vi.fn(),
			createMany: vi.fn(),
			findMany: vi.fn(),
			update: vi.fn(),
		},
		revenue: {
			create: vi.fn(),
			createMany: vi.fn(),
			findMany: vi.fn(),
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

vi.mock("../data/queries", () => ({
	getAssignmentTypesByValues: getAssignmentTypesByValuesMock,
	getContractAccessResourceById: getContractAccessResourceByIdMock,
	getContractById: getContractByIdMock,
	getContractStatusByValue: getContractStatusByValueMock,
	getLegalAreaByValue: getLegalAreaByValueMock,
	getRevenueTypesByValues: getRevenueTypesByValuesMock,
}));

import {
	createContract,
	deleteContract,
	resolveContractAssignments,
	restoreContract,
	updateContract,
} from "../data/mutations";

function createLookup(overrides: Record<string, unknown> = {}) {
	return {
		id: 1,
		value: "ACTIVE",
		label: "Ativo",
		isActive: true,
		...overrides,
	};
}

function createEmployee(overrides: Record<string, unknown> = {}) {
	return {
		id: 10,
		fullName: "Maria Silva",
		email: "maria@example.com",
		oabNumber: "RS123456",
		firmId: 1,
		roleId: 1,
		typeId: 1,
		avatarUrl: null,
		isActive: true,
		deletedAt: null,
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-01T00:00:00.000Z"),
		referralPercentage: 0.1,
		remunerationPercentage: 0.3,
		type: createLookup({
			id: 2,
			value: "LAWYER",
			label: "Advogado",
		}),
		...overrides,
	};
}

function createBaseInput() {
	return {
		clientId: "5",
		processNumber: "PROC-001",
		legalArea: "SOCIAL_SECURITY",
		status: "ACTIVE",
		feePercentage: 0.3,
		notes: "  observacao  ",
		allowStatusChange: true,
		isActive: true,
		assignments: [
			{
				employeeId: "10",
				assignmentType: "RESPONSIBLE",
				isActive: true,
			},
		],
		revenues: [
			{
				type: "MONTHLY",
				totalValue: 1000,
				downPaymentValue: 100,
				paymentStartDate: "2026-01-15",
				totalInstallments: 3,
				isActive: true,
			},
		],
	};
}

describe("contract data mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(prismaMock),
		);
		prismaMock.client.findFirst.mockResolvedValue({ id: 5 });
		prismaMock.contract.create.mockResolvedValue({
			id: 99,
			processNumber: "PROC-001",
		});
		prismaMock.contract.findFirst.mockResolvedValue({
			id: 99,
			processNumber: "PROC-001",
			legalAreaId: 7,
			statusId: 8,
			allowStatusChange: true,
			status: { value: "ACTIVE" },
		});
		prismaMock.contract.update.mockResolvedValue({});
		prismaMock.contractEmployee.findMany.mockResolvedValue([
			{ id: 1 },
			{ id: 2 },
		]);
		prismaMock.revenue.findMany.mockResolvedValue([{ id: 20 }, { id: 21 }]);
		getLegalAreaByValueMock.mockResolvedValue(
			createLookup({ id: 7, value: "SOCIAL_SECURITY" }),
		);
		getContractStatusByValueMock.mockResolvedValue(
			createLookup({ id: 8, value: "ACTIVE" }),
		);
		getAssignmentTypesByValuesMock.mockResolvedValue([
			createLookup({ id: 9, value: "RESPONSIBLE", label: "Responsável" }),
		]);
		getRevenueTypesByValuesMock.mockResolvedValue([
			createLookup({ id: 11, value: "MONTHLY", label: "Mensal" }),
		]);
		prismaMock.employee.findMany.mockResolvedValue([]);
		getContractAccessResourceByIdMock.mockResolvedValue({
			id: 99,
			deletedAt: null,
			resource: {
				firmId: 1,
				statusValue: "ACTIVE",
				allowStatusChange: true,
				assignedEmployeeIds: [10],
			},
			hasActiveRevenues: false,
		});
		getContractByIdMock.mockResolvedValue({
			id: 99,
			processNumber: "PROC-001",
			isSoftDeleted: true,
		});
	});

	it("rejects non-admin attempts to lock status on create", async () => {
		await expect(
			createContract({
				scope: { firmId: 1 },
				isAdmin: false,
				input: { ...createBaseInput(), allowStatusChange: false },
			}),
		).rejects.toThrow(CONTRACT_ERRORS.CONTRACT_STATUS_LOCK_FORBIDDEN);

		expect(prismaMock.client.findFirst).not.toHaveBeenCalled();
	});

	it("rejects inactive clients on create before transaction", async () => {
		prismaMock.client.findFirst.mockResolvedValue(null);

		await expect(
			createContract({
				scope: { firmId: 1 },
				isAdmin: true,
				input: createBaseInput(),
			}),
		).rejects.toThrow(CONTRACT_ERRORS.CONTRACT_CLIENT_INACTIVE);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("rejects missing and inactive collaborators while resolving assignments", async () => {
		await expect(
			resolveContractAssignments(prismaMock as never, 1, [
				{
					employeeId: "10",
					assignmentType: "RESPONSIBLE",
					isActive: true,
				},
			]),
		).rejects.toThrow(CONTRACT_ERRORS.CONTRACT_EMPLOYEE_NOT_FOUND);

		prismaMock.employee = {
			findMany: vi
				.fn()
				.mockResolvedValue([createEmployee({ isActive: false })]),
		};

		await expect(
			resolveContractAssignments(prismaMock as never, 1, [
				{
					employeeId: "10",
					assignmentType: "RESPONSIBLE",
					isActive: true,
				},
			]),
		).rejects.toThrow(CONTRACT_ERRORS.CONTRACT_EMPLOYEE_INACTIVE);
	});

	it("rejects non-admin attempts to change status-lock semantics on update", async () => {
		await expect(
			updateContract({
				scope: { firmId: 1 },
				isAdmin: false,
				input: { ...createBaseInput(), id: 99, allowStatusChange: false },
			}),
		).rejects.toThrow(CONTRACT_ERRORS.CONTRACT_STATUS_LOCK_FORBIDDEN);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("rejects status changes when current contract has status lock enabled", async () => {
		prismaMock.contract.findFirst.mockResolvedValue({
			id: 99,
			processNumber: "PROC-001",
			legalAreaId: 7,
			statusId: 8,
			allowStatusChange: false,
			status: { value: "ACTIVE" },
		});
		getContractStatusByValueMock.mockResolvedValue(
			createLookup({ id: 80, value: "COMPLETED", label: "Concluído" }),
		);

		await expect(
			updateContract({
				scope: { firmId: 1 },
				isAdmin: true,
				input: { ...createBaseInput(), id: 99, status: "COMPLETED" },
			}),
		).rejects.toThrow(CONTRACT_ERRORS.CONTRACT_STATUS_CHANGE_LOCKED);
	});

	it("syncs removed assignments and revenues during successful update", async () => {
		prismaMock.employee = {
			findMany: vi.fn().mockResolvedValue([createEmployee()]),
		};

		await expect(
			updateContract({
				actor: { id: 1, name: "Admin", email: "admin@example.com" },
				scope: { firmId: 1 },
				isAdmin: true,
				input: {
					...createBaseInput(),
					id: 99,
					assignments: [
						{
							id: 1,
							employeeId: "10",
							assignmentType: "RESPONSIBLE",
							isActive: true,
						},
					],
					revenues: [
						{
							id: 20,
							type: "MONTHLY",
							totalValue: 1000,
							downPaymentValue: 100,
							paymentStartDate: "2026-01-15",
							totalInstallments: 3,
							isActive: true,
						},
					],
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.contractEmployee.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: expect.objectContaining({
				firmId: 1,
				employeeId: 10,
				deletedAt: null,
			}),
		});
		expect(prismaMock.contractEmployee.update).toHaveBeenCalledWith({
			where: { id: 2 },
			data: { deletedAt: expect.any(Date) },
		});
		expect(prismaMock.revenue.update).toHaveBeenCalledWith({
			where: { id: 20 },
			data: expect.objectContaining({
				firmId: 1,
				typeId: 11,
				deletedAt: null,
			}),
		});
		expect(prismaMock.revenue.update).toHaveBeenCalledWith({
			where: { id: 21 },
			data: { deletedAt: expect.any(Date) },
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				firmId: 1,
				action: "UPDATE",
				entityType: "Contract",
				entityId: 99,
			}),
		);
	});

	it("blocks delete when active revenues still exist", async () => {
		getContractAccessResourceByIdMock.mockResolvedValue({
			id: 99,
			deletedAt: null,
			resource: {
				firmId: 1,
				statusValue: "ACTIVE",
				allowStatusChange: true,
				assignedEmployeeIds: [10],
			},
			hasActiveRevenues: true,
		});

		await expect(deleteContract({ firmId: 1, id: 99 })).rejects.toThrow(
			CONTRACT_ERRORS.CONTRACT_HAS_ACTIVE_REVENUES,
		);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("rejects restore when contract is not soft-deleted", async () => {
		getContractByIdMock.mockResolvedValue({
			id: 99,
			processNumber: "PROC-001",
			isSoftDeleted: false,
		});

		await expect(restoreContract({ firmId: 1, id: 99 })).rejects.toThrow(
			CONTRACT_ERRORS.CONTRACT_NOT_FOUND,
		);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});
});
