// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
	identity: {
		isLoaded: true,
		userId: "user_one",
		sessionId: "sess_one",
		orgId: "org_one",
		sessionClaims: {},
	},
	invalidate: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@clerk/tanstack-react-start", () => ({
	useAuth: () => state.identity,
}));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	useRouter: () => ({ invalidate: state.invalidate }),
}));
vi.mock("../server", () => ({ getOptionalServerLoggedUserSession: vi.fn() }));

import { ClerkSessionBoundary } from "../client";

afterEach(() => {
	cleanup();
	state.identity.isLoaded = true;
});

describe("Organization context boundary", () => {
	it("shows fallback while SDK loads without rendering protected content", () => {
		state.identity.isLoaded = false;
		render(
			<QueryClientProvider client={new QueryClient()}>
				<ClerkSessionBoundary fallback={<p role="status">Carregando acesso</p>}>
					<div>Protected content</div>
				</ClerkSessionBoundary>
			</QueryClientProvider>,
		);
		expect(screen.getByRole("status")).toBeTruthy();
		expect(screen.queryByText("Protected content")).toBeNull();
	});

	it("hides old content and clears all cached unit data before revalidating", async () => {
		state.identity.orgId = "org_one";
		let finishInvalidation: () => void = () => {};
		state.invalidate.mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					finishInvalidation = resolve;
				}),
		);
		const client = new QueryClient();
		client.setQueryData(["clients"], [{ firmId: 1, name: "Old unit client" }]);
		const cancel = vi.spyOn(client, "cancelQueries");
		const clear = vi.spyOn(client, "clear");
		const renderUnit = (label: string) => (
			<QueryClientProvider client={client}>
				<ClerkSessionBoundary>
					<div>{label}</div>
				</ClerkSessionBoundary>
			</QueryClientProvider>
		);
		const { rerender } = render(renderUnit("Old unit content"));
		expect(screen.getByText("Old unit content")).toBeTruthy();
		state.identity.orgId = "org_two";
		rerender(renderUnit("New unit content"));
		expect(screen.queryByText("Old unit content")).toBeNull();
		expect(screen.queryByText("New unit content")).toBeNull();
		await waitFor(() => expect(state.invalidate).toHaveBeenCalled());
		expect(cancel).toHaveBeenCalledOnce();
		expect(clear).toHaveBeenCalledOnce();
		expect(client.getQueryData(["clients"])).toBeUndefined();
		await act(async () => {
			finishInvalidation();
		});
		expect(screen.getByText("New unit content")).toBeTruthy();
		client.clear();
	});
});
