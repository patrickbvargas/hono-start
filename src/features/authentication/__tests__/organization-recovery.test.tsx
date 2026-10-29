// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
	isLoaded: true,
	sdkStatus: "ready",
	session: null as null | { status: string; currentTask?: { key: string } },
	isSignedIn: true,
	orgId: "org_unavailable" as string | null,
	retry: vi.fn(),
	logout: vi.fn(),
	isPending: false,
}));
vi.mock("@clerk/tanstack-react-start", () => ({
	useAuth: () => state,
	useSession: () => ({ session: state.session }),
	ClerkLoading: ({ children }: { children: ReactNode }) =>
		state.sdkStatus === "loading" ? children : null,
	ClerkFailed: ({ children }: { children: ReactNode }) =>
		state.sdkStatus === "failed" ? children : null,
	ClerkDegraded: ({ children }: { children: ReactNode }) =>
		state.sdkStatus === "degraded" ? children : null,
	ClerkLoaded: ({ children }: { children: ReactNode }) =>
		["ready", "degraded"].includes(state.sdkStatus) ? children : null,
	Show: ({ children, when }: { children: ReactNode; when: string }) =>
		(when === "signed-in" ? state.isSignedIn : !state.isSignedIn)
			? children
			: null,
	RedirectToTasks: ({ redirectUrl }: { redirectUrl: string }) => (
		<div data-testid="task-redirect" data-destination={redirectUrl} />
	),

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
	SignIn: ({ forceRedirectUrl }: { forceRedirectUrl: string }) => (
		<div data-testid="sign-in" data-destination={forceRedirectUrl}>
			Entrar
		</div>
	),
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
	state.sdkStatus = "ready";
	state.isSignedIn = true;
	state.session = null;
	window.history.replaceState(null, "", "/");
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

describe("Clerk control states", () => {
	it("shows loading instead of a blank login", () => {
		state.sdkStatus = "loading";
		render(<LoginForm />);
		expect(screen.getByRole("status").textContent).toContain(
			"Carregando acesso",
		);
		expect(screen.queryByTestId("organization-list")).toBeNull();
	});
	it("shows actionable SDK failure without login controls", () => {
		state.sdkStatus = "failed";
		render(<LoginForm />);
		expect(screen.getByRole("alert").textContent).toContain(
			"serviço de acesso",
		);
		expect(
			screen.getByRole("button", { name: "Recarregar página" }),
		).toBeTruthy();
		expect(screen.queryByTestId("organization-list")).toBeNull();
	});
	it("keeps loaded content visible with a degraded-service notice", () => {
		state.sdkStatus = "degraded";
		render(<LoginForm />);
		expect(screen.getByRole("status").textContent).toContain(
			"parcialmente indisponível",
		);
		expect(screen.getByTestId("organization-list")).toBeTruthy();
	});
	it("shows sign-in only while signed out", () => {
		state.isSignedIn = false;
		render(<LoginForm />);
		expect(screen.getByText("Entrar")).toBeTruthy();
		expect(screen.queryByTestId("organization-list")).toBeNull();
	});
	it("resumes interrupted pending tasks with a validated return destination", () => {
		state.session = { status: "pending", currentTask: { key: "setup-mfa" } };
		render(<LoginForm redirectTo="/clientes?page=2" />);
		expect(
			screen.getByTestId("task-redirect").getAttribute("data-destination"),
		).toBe("/login?selectOrganization=true&redirect=%2Fclientes%3Fpage%3D2");
		expect(screen.queryByTestId("organization-list")).toBeNull();
	});
	it("does not redirect again while already on a task", () => {
		window.history.replaceState(null, "", "/login#/tasks/reset-password");
		state.session = {
			status: "pending",
			currentTask: { key: "reset-password" },
		};
		render(<LoginForm />);
		expect(screen.queryByTestId("task-redirect")).toBeNull();
		expect(screen.getByText("Entrar")).toBeTruthy();
	});
	it("rejects external destinations during task recovery", () => {
		state.session = {
			status: "pending",
			currentTask: { key: "choose-organization" },
		};
		render(<LoginForm redirectTo="https://outside.example" />);
		expect(
			screen.getByTestId("task-redirect").getAttribute("data-destination"),
		).toBe("/login?selectOrganization=true&redirect=%2F");
	});
});

it("switches from task redirect to task form on a hash change", () => {
	state.session = { status: "pending", currentTask: { key: "setup-mfa" } };
	render(<LoginForm />);
	expect(screen.getByTestId("task-redirect")).toBeTruthy();
	window.history.replaceState(null, "", "/login#/tasks/setup-mfa");
	fireEvent(window, new Event("hashchange"));
	expect(screen.queryByTestId("task-redirect")).toBeNull();
	expect(screen.getByText("Entrar")).toBeTruthy();
});

it("routes completed sign-in through organization selection", () => {
	state.isSignedIn = false;
	render(<LoginForm redirectTo="/clientes?page=2" />);
	expect(screen.getByTestId("sign-in").getAttribute("data-destination")).toBe(
		"/login?selectOrganization=true&redirect=%2Fclientes%3Fpage%3D2",
	);
});

it("allows requested organization selection before resolving active-unit configuration", () => {
	render(
		<LoginForm
			selectOrganization
			access={{ status: "configuration_required", issues: ["firm_missing"] }}
			redirectTo="/contratos"
		/>,
	);
	expect(screen.getByTestId("organization-list")).toBeTruthy();
	expect(screen.queryByRole("alert")).toBeNull();
	expect(
		screen.getByTestId("organization-list").getAttribute("data-destination"),
	).toBe("/contratos");
});
