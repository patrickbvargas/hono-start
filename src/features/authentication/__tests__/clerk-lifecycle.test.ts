import type { WebhookEvent } from "@clerk/tanstack-react-start/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	existing: vi.fn(),
	receipt: vi.fn(),
	unlink: vi.fn(),
	user: vi.fn(),
	verify: vi.fn(),
	reconcile: vi.fn(),
}));
vi.mock("@clerk/tanstack-react-start/server", () => ({
	clerkClient: () => ({ users: { getUser: mocks.user } }),
}));
vi.mock("@/shared/lib/prisma", () => ({
	prisma: {
		clerkWebhookReceipt: { findUnique: mocks.existing, upsert: mocks.receipt },
		employee: { updateMany: mocks.unlink },
	},
}));

import { recordClerkEvent } from "../data/clerk-lifecycle";

describe("Clerk webhook reconciliation", () => {
	const deleted = {
		type: "user.deleted",
		data: { id: "user_one" },
	} as WebhookEvent;
	beforeEach(() => vi.resetAllMocks());
	it("ignores duplicate completed deliveries", async () => {
		mocks.existing.mockResolvedValue({ id: "delivery" });
		await recordClerkEvent("delivery", deleted);
		expect(mocks.user).not.toHaveBeenCalled();
	});
	it("ignores stale deletion snapshots when the provider still has the user", async () => {
		mocks.user.mockResolvedValue({ id: "user_one" });
		await recordClerkEvent("delivery", deleted);
		expect(mocks.unlink).not.toHaveBeenCalled();
		expect(mocks.receipt).toHaveBeenCalled();
	});
	it("records deletion without changing business employees", async () => {
		await recordClerkEvent("delivery", deleted);
		expect(mocks.unlink).not.toHaveBeenCalled();
		expect(mocks.receipt).toHaveBeenCalled();
	});
});
