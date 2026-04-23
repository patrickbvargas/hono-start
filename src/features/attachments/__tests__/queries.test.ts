import { beforeEach, describe, expect, it, vi } from "vitest";
import { ATTACHMENT_ERRORS } from "../constants/errors";

const { getContractAccessResourceByIdMock, prismaMock } = vi.hoisted(() => ({
	getContractAccessResourceByIdMock: vi.fn(),
	prismaMock: {
		client: {
			findFirst: vi.fn(),
		},
		employee: {
			findFirst: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/features/contracts/data/queries", () => ({
	getContractAccessResourceById: getContractAccessResourceByIdMock,
}));

import {
	assertAttachmentOwnerExists,
	getAttachmentContractOwnerResource,
	getAttachmentEmployeeOwnerResource,
} from "../data/queries";

describe("attachment owner access queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("resolves employee owners only within the authenticated firm", async () => {
		prismaMock.employee.findFirst.mockResolvedValue({
			id: 7,
			deletedAt: null,
			firmId: 100,
		});

		await expect(
			getAttachmentEmployeeOwnerResource(100, 7),
		).resolves.toMatchObject({
			id: 7,
			deletedAt: null,
			resource: {
				employeeId: 7,
				firmId: 100,
			},
		});

		prismaMock.employee.findFirst.mockResolvedValue(null);

		await expect(
			getAttachmentEmployeeOwnerResource(100, 7),
		).resolves.toBeNull();
	});

	it("rejects cross-tenant contract owners", async () => {
		getContractAccessResourceByIdMock.mockResolvedValue({
			id: 9,
			deletedAt: null,
			resource: {
				firmId: 200,
				assignedEmployeeIds: [10],
			},
		});

		await expect(
			getAttachmentContractOwnerResource(100, 9),
		).resolves.toBeNull();
	});

	it("throws before persistence when owner context does not exist", async () => {
		prismaMock.client.findFirst.mockResolvedValue(null);

		await expect(
			assertAttachmentOwnerExists({
				firmId: 100,
				input: { clientId: 99 },
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
	});
});
