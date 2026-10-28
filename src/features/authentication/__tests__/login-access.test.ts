import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/features/authentication", () => ({ LoginForm: () => null }));
vi.mock("@/shared/session", () => ({
	getSessionAccessQueryOptions: () => ({ queryKey: ["session", "access"] }),
	getSafeInternalRedirectPath: (path?: string) =>
		path?.startsWith("/") && !path.startsWith("//") && path !== "/login"
			? path
			: undefined,
}));

import { Route } from "@/routes/_auth/login";

const beforeLoad = Route.options.beforeLoad as unknown as (options: {
	context: { queryClient: { query: typeof mocks.query } };
	search: { redirect?: string };
}) => Promise<unknown>;

beforeEach(() => vi.resetAllMocks());

describe("login access verification", () => {
	it("passes server-verified configuration issues to the login surface", async () => {
		const access = {
			status: "configuration_required",
			issues: ["employee_missing", "firm_missing"],
		};
		mocks.query.mockResolvedValue(access);
		await expect(
			beforeLoad({ context: { queryClient: mocks }, search: {} }),
		).resolves.toEqual({ access });
	});
	it.each([
		"/clientes?page=2",
		"/contratos/7",
		undefined,
		"https://outside.example",
		"//outside.example",
		"/login",
	])("resumes a safe destination after correction: %s", async (destination) => {
		mocks.query.mockResolvedValue({ status: "ready", session: {} });
		await expect(
			beforeLoad({
				context: { queryClient: mocks },
				search: { redirect: destination },
			}),
		).rejects.toMatchObject({
			options: {
				href:
					destination?.startsWith("/") &&
					!destination.startsWith("//") &&
					destination !== "/login"
						? destination
						: "/",
			},
		});
	});
	it("keeps infrastructure failures separate from metadata findings", async () => {
		mocks.query.mockRejectedValue(new Error("unavailable"));
		await expect(
			beforeLoad({ context: { queryClient: mocks }, search: {} }),
		).rejects.toThrow("unavailable");
	});
});
