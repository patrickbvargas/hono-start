import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => options,
	redirect: (options: unknown) => options,
}));
vi.mock("@/features/authentication", () => ({
	LoginForm: () => null,
	getLoginOrganizationCountQueryOptions: () => ({
		queryKey: ["organization-count"],
	}),
}));
vi.mock("@/shared/session", () => ({
	getSessionAccessQueryOptions: () => ({ queryKey: ["access"] }),
	getSafeInternalRedirectPath: (path?: string) =>
		path?.startsWith("/") && !path.startsWith("//") ? path : undefined,
}));

import { Route } from "@/routes/_auth/login";

const route = Route as unknown as {
	beforeLoad: (args: {
		context: { queryClient: { query: ReturnType<typeof vi.fn> } };
		search: { selectOrganization?: boolean; redirect?: string };
	}) => Promise<unknown>;
};
function load(
	count: number,
	selectOrganization = true,
	access = { status: "ready" },
	redirect = "/contratos",
) {
	const query = vi
		.fn()
		.mockImplementation(({ queryKey }: { queryKey: string[] }) =>
			Promise.resolve(queryKey[0] === "access" ? access : count),
		);
	return {
		query,
		result: route.beforeLoad({
			context: { queryClient: { query } },
			search: { selectOrganization, redirect },
		}),
	};
}
describe("post-login organization gate", () => {
	it("asks multi-organization users to select even with an active unit", async () => {
		await expect(load(2).result).resolves.toEqual({
			access: { status: "ready" },
			organizationSelectionRequired: true,
		});
	});
	it("continues single-organization users to the original destination", async () => {
		await expect(load(1).result).rejects.toEqual({ href: "/contratos" });
	});
	it("keeps the selector when session revalidation precedes Clerk redirect", async () => {
		const { result, query } = load(2, false);
		await expect(result).resolves.toEqual({
			access: { status: "ready" },
			organizationSelectionRequired: true,
		});
		expect(query).toHaveBeenCalledTimes(2);
	});
	it("allows selection before metadata recovery but never grants product access", async () => {
		await expect(
			load(2, true, { status: "configuration_required" }).result,
		).resolves.toEqual({
			access: { status: "configuration_required" },
			organizationSelectionRequired: true,
		});
	});
	it("propagates provider failure rather than skipping selection", async () => {
		const query = vi
			.fn()
			.mockResolvedValueOnce({ status: "ready" })
			.mockRejectedValueOnce(new Error("Provider unavailable"));
		await expect(
			route.beforeLoad({
				context: { queryClient: { query } },
				search: { selectOrganization: true },
			}),
		).rejects.toThrow("Provider unavailable");
	});
});
