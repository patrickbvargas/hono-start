import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), reconcile: vi.fn() }));
vi.mock("@clerk/backend/webhooks", () => ({ verifyWebhook: mocks.verify }));
vi.mock("@/shared/config/env", () => ({
	env: { CLERK_WEBHOOK_SIGNING_SECRET: "whsec_test" },
}));
vi.mock("../data/clerk-lifecycle", () => ({
	reconcileClerkEmployeeEvent: mocks.reconcile,
}));

import { handleClerkEmployeeWebhook } from "../api/webhooks";

describe("Clerk webhook signature boundary", () => {
	beforeEach(() => vi.resetAllMocks());
	it("rejects invalid signatures before any domain reconciliation", async () => {
		mocks.verify.mockRejectedValue(new Error("invalid"));
		const response = await handleClerkEmployeeWebhook(
			new Request("http://localhost/api/webhooks/clerk", {
				method: "POST",
				body: "{}",
			}),
		);
		expect(response.status).toBe(400);
		expect(mocks.reconcile).not.toHaveBeenCalled();
	});
	it("verifies the original request and records the signed delivery", async () => {
		const event = { type: "user.updated", data: { id: "user_one" } };
		mocks.verify.mockResolvedValue(event);
		const request = new Request("http://localhost/api/webhooks/clerk", {
			method: "POST",
			headers: { "svix-id": "delivery" },
			body: "{}",
		});
		expect((await handleClerkEmployeeWebhook(request)).status).toBe(200);
		expect(mocks.verify).toHaveBeenCalledWith(request, {
			signingSecret: "whsec_test",
		});
		expect(mocks.reconcile).toHaveBeenCalledWith("delivery", event);
	});
	it("returns a retryable response on reconciliation failure", async () => {
		mocks.verify.mockResolvedValue({ type: "user.updated" });
		mocks.reconcile.mockRejectedValue(new Error("unavailable"));
		expect(
			(
				await handleClerkEmployeeWebhook(
					new Request("http://localhost", {
						method: "POST",
						headers: { "svix-id": "delivery" },
					}),
				)
			).status,
		).toBe(503);
	});
});
