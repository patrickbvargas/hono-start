// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
	isLoaded: true,
	isSignedIn: true,
	orgId: "org_unavailable" as string | null,
	retry: vi.fn(),
	logout: vi.fn(),
	isPending: false,
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

vi.mock("../hooks/use-access-recovery", () => ({
	useAccessRecovery: () => ({
		handleRetry: state.retry,
		isPending: state.isPending,
	}),
}));
vi.mock("../hooks/use-logout", () => ({
	useLogout: () => ({ handleLogout: state.logout, isPending: false }),
}));

import { LoginForm } from "../components/login-form";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
	state.isPending = false;
});

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

describe("required access configuration", () => {
	it("lists both missing bindings with persistent administrator guidance and recovery", () => {
		render(
			<LoginForm
				redirectTo="/clientes?page=2"
				access={{
					status: "configuration_required",
					issues: ["employee_missing", "firm_missing"],
				}}
			/>,
		);
		expect(screen.getByRole("alert").textContent).toContain(
			"Configuração de acesso incompleta",
		);
		expect(screen.getByRole("alert").textContent).toContain(
			"employeeId é obrigatório",
		);
		expect(screen.getByRole("alert").textContent).toContain(
			"firmId é obrigatório",
		);
		expect(screen.getByRole("alert").textContent).toContain(
			"privateMetadata no Clerk",
		);
		fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
		expect(state.retry).toHaveBeenCalledOnce();
		fireEvent.click(screen.getByRole("button", { name: "Sair" }));
		expect(state.logout).toHaveBeenCalledOnce();
		expect(screen.queryByTestId("organization-list")).toBeNull();
	});
	it.each([
		"employee_missing",
		"employee_invalid",
		"employee_unavailable",
	] as const)(
		"hides organization selection for %s until Clerk correction",
		(issue) => {
			render(
				<LoginForm
					access={{ status: "configuration_required", issues: [issue] }}
				/>,
			);
			expect(screen.queryByTestId("organization-list")).toBeNull();
			expect(screen.getByRole("alert").textContent).toContain(
				"privateMetadata no Clerk",
			);
			expect(
				screen.getByRole("button", { name: "Tentar novamente" }),
			).toBeTruthy();
			expect(screen.getByRole("button", { name: "Sair" })).toBeTruthy();
		},
	);
	it.each(["firm_missing", "firm_invalid", "firm_unavailable"] as const)(
		"hides organization selection for %s until Clerk correction",
		(issue) => {
			render(
				<LoginForm
					redirectTo="/clientes?page=2"
					access={{ status: "configuration_required", issues: [issue] }}
				/>,
			);
			expect(screen.queryByTestId("organization-list")).toBeNull();
			expect(screen.getByRole("alert").textContent).toContain(
				"privateMetadata no Clerk",
			);
			expect(
				screen.getByRole("button", { name: "Tentar novamente" }),
			).toBeTruthy();
			expect(screen.getByRole("button", { name: "Sair" })).toBeTruthy();
		},
	);
	it.each([
		["employee_invalid", "employeeId deve ser um número inteiro positivo"],
		["employee_unavailable", "colaborador existente e ativo"],
		["firm_invalid", "firmId deve ser um número inteiro positivo"],
		["firm_unavailable", "unidade existente"],
	] as const)("explains %s", (issue, message) => {
		render(
			<LoginForm
				access={{ status: "configuration_required", issues: [issue] }}
			/>,
		);
		expect(screen.getByRole("alert").textContent).toContain(message);
		expect(screen.getByRole("alert").textContent).not.toContain(
			"sessão expirou",
		);
	});
	it("disables recovery actions during verification", () => {
		state.isPending = true;
		render(
			<LoginForm
				access={{ status: "configuration_required", issues: ["firm_missing"] }}
			/>,
		);
		expect(
			(
				screen.getByRole("button", {
					name: "Verificando acesso...",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
		expect(
			(screen.getByRole("button", { name: "Sair" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
	});
});
