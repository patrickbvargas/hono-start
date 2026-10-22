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

import { reconcileClerkEmployeeEvent } from "../data/clerk-lifecycle";

describe("Clerk webhook reconciliation", () => {
	const deleted = {
		type: "user.deleted",
		data: { id: "user_one" },
	} as WebhookEvent;
	beforeEach(() => vi.resetAllMocks());
	it("ignores duplicate completed deliveries", async () => {
		mocks.existing.mockResolvedValue({ id: "delivery" });
		await reconcileClerkEmployeeEvent("delivery", deleted);
		expect(mocks.user).not.toHaveBeenCalled();
	});
	it("ignores stale deletion snapshots when the provider still has the user", async () => {
		mocks.user.mockResolvedValue({ id: "user_one" });
		await reconcileClerkEmployeeEvent("delivery", deleted);
		expect(mocks.unlink).not.toHaveBeenCalled();
		expect(mocks.receipt).toHaveBeenCalled();
	});
	it("unlinks only the explicit identity after confirmed provider deletion", async () => {
		mocks.user.mockRejectedValue({ status: 404 });
		await reconcileClerkEmployeeEvent("delivery", deleted);
		expect(mocks.unlink).toHaveBeenCalledWith({
			where: { clerkUserId: "user_one" },
			data: { clerkUserId: null },
		});
	});
	it("keeps a failed delivery retryable on provider outage", async () => {
		mocks.user.mockRejectedValue({ status: 503 });
		await expect(
			reconcileClerkEmployeeEvent("delivery", deleted),
		).rejects.toEqual({ status: 503 });
		expect(mocks.unlink).not.toHaveBeenCalled();
		expect(mocks.receipt).not.toHaveBeenCalled();
	});
});
