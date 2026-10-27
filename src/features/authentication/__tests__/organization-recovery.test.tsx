// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
	isLoaded: true,
	isSignedIn: true,
	orgId: "org_unavailable" as string | null,
}));
vi.mock("@clerk/tanstack-react-start", () => ({
	useAuth: () => state,
	OrganizationList: ({
		hidePersonal,
		afterSelectOrganizationUrl,
	}: {
		hidePersonal: boolean;
		afterSelectOrganizationUrl: string;
	}) => (
		<div
			data-testid="organization-list"
			data-hide-personal={hidePersonal}
			data-destination={afterSelectOrganizationUrl}
		>
			Escolha sua organização
		</div>
	),
	SignIn: () => <div>Entrar</div>,
}));
vi.mock("@/shared/session/client", () => ({
	getSafeInternalRedirectPath: (path?: string) =>
		path?.startsWith("/") && !path.startsWith("//") ? path : undefined,
}));

import { LoginForm } from "../components/login-form";

afterEach(cleanup);

describe("organization access recovery", () => {
	it("keeps selection available after denial and preserves destination", () => {
		render(<LoginForm redirectTo="/clientes" />);
		expect(screen.getByRole("alert").textContent).toContain(
			"conferir a configuração da unidade",
		);
		expect(
			screen.getByTestId("organization-list").getAttribute("data-destination"),
		).toBe("/clientes");
		expect(
			screen
				.getByTestId("organization-list")
				.getAttribute("data-hide-personal"),
		).toBe("true");
		expect(screen.queryByText("Entrar")).toBeNull();
	});

	it("does not imply denied access before an Organization is selected", () => {
		state.orgId = null;
		render(<LoginForm />);
		expect(screen.queryByRole("alert")).toBeNull();
		expect(screen.getByTestId("organization-list")).toBeTruthy();
		state.orgId = "org_unavailable";
	});
});
