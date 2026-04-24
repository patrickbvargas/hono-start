import { beforeEach, describe, expect, it, vi } from "vitest";
import { ATTACHMENT_ERRORS } from "../constants/errors";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		client: {
			findFirst: vi.fn(),
		},
		contract: {
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
		prismaMock.contract.findFirst.mockResolvedValue(null);

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
