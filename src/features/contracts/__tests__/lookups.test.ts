import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONTRACT_ERRORS } from "../constants/errors";

const {
	getAssignmentTypesByValuesMock,
	getContractAccessResourceByIdMock,
	getContractByIdMock,
	getContractStatusByValueMock,
	getLegalAreaByValueMock,
	getRevenueTypesByValuesMock,
	prismaMock,
} = vi.hoisted(() => ({
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
		contract: {
			create: vi.fn(),
			findFirst: vi.fn(),
			update: vi.fn(),
		},
		contractEmployee: {
			createMany: vi.fn(),
			findMany: vi.fn(),
			update: vi.fn(),
			create: vi.fn(),
		},
		revenue: {
			createMany: vi.fn(),
			findMany: vi.fn(),
			update: vi.fn(),
			create: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/features/audit-logs/data/mutations", () => ({
	createAuditLog: vi.fn(),
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
	assertContractLookupSelections,
	resolveContractLookupSelections,
	resolveRevenueTypes,
} from "../data/mutations";

const activeLookup = (overrides: Record<string, unknown> = {}) => ({
	id: 1,
	value: "ACTIVE",
	label: "Ativo",
	isActive: true,
	...overrides,
});

describe("contract lookup-backed writes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects unknown legal area and status selections", async () => {
		getLegalAreaByValueMock.mockResolvedValue(null);
		getContractStatusByValueMock.mockResolvedValue(activeLookup());

		await expect(
			resolveContractLookupSelections({
				legalArea: "UNKNOWN",
				status: "ACTIVE",
			}),
		).rejects.toThrow(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
		expect(prismaMock.$transaction).not.toHaveBeenCalled();

		getLegalAreaByValueMock.mockResolvedValue(activeLookup());
		getContractStatusByValueMock.mockResolvedValue(null);

		await expect(
			resolveContractLookupSelections({
				legalArea: "SOCIAL_SECURITY",
				status: "UNKNOWN",
			}),
		).rejects.toThrow(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("rejects inactive changed lookup selections but allows unchanged persisted selections", () => {
		const legalArea = activeLookup({
			id: 10,
			value: "SOCIAL_SECURITY",
			isActive: false,
		});
		const status = activeLookup({
			id: 20,
			value: "ACTIVE",
			isActive: false,
		});

		expect(() =>
			assertContractLookupSelections({
				legalArea,
				status: activeLookup(),
			}),
		).toThrow(CONTRACT_ERRORS.CONTRACT_LEGAL_AREA_INACTIVE);

		expect(() =>
			assertContractLookupSelections({
				legalArea: activeLookup(),
				status,
			}),
		).toThrow(CONTRACT_ERRORS.CONTRACT_STATUS_INACTIVE);

		expect(() =>
			assertContractLookupSelections(
				{ legalArea, status },
				{ currentLegalAreaId: legalArea.id, currentStatusId: status.id },
			),
		).not.toThrow();
	});

	it("resolves revenue types by stable value and rejects inactive selections", async () => {
		getRevenueTypesByValuesMock.mockResolvedValue([
			activeLookup({
				id: 30,
				value: "CONTRACTUAL",
				label: "Honorários contratuais",
			}),
		]);

		await expect(
			resolveRevenueTypes([
				{
					type: "CONTRACTUAL",
					totalValue: 10000,
					downPaymentValue: null,
					paymentStartDate: "2026-01-15",
					totalInstallments: 10,
					isActive: true,
				},
			]),
		).resolves.toMatchObject([
			{
				type: expect.objectContaining({
					id: 30,
					value: "CONTRACTUAL",
				}),
			},
		]);

		getRevenueTypesByValuesMock.mockResolvedValue([]);

		await expect(
			resolveRevenueTypes([
				{
					type: "UNKNOWN",
					totalValue: 10000,
					downPaymentValue: null,
					paymentStartDate: "2026-01-15",
					totalInstallments: 10,
					isActive: true,
				},
			]),
		).rejects.toThrow(CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_NOT_FOUND);
		expect(prismaMock.$transaction).not.toHaveBeenCalled();

		getRevenueTypesByValuesMock.mockResolvedValue([
			activeLookup({
				id: 31,
				value: "CONTRACTUAL",
				isActive: false,
			}),
		]);

		await expect(
			resolveRevenueTypes([
				{
					type: "CONTRACTUAL",
					totalValue: 10000,
					downPaymentValue: null,
					paymentStartDate: "2026-01-15",
					totalInstallments: 10,
					isActive: true,
				},
			]),
		).rejects.toThrow(CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_INACTIVE);
		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});
});
