import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string) {
	return readFileSync(path, "utf8");
}

describe("authentication public screen contracts", () => {
	it("keeps the authentication feature barrel route-facing", () => {
		const content = read("src/features/authentication/index.ts");

		expect(content).toContain(
			'export { AuthenticationScreen } from "./components/screen";',
		);
		expect(content).toContain(
			'export { LoginForm } from "./components/login-form";',
		);
		expect(content).toContain(
			'export { PasswordResetRequestForm } from "./components/password-reset-request-form";',
		);
		expect(content).toContain(
			'export { PasswordResetCompleteForm } from "./components/password-reset-complete-form";',
		);
		expect(content).toContain(
			'export { useLogout } from "./hooks/use-logout";',
		);
		expect(content).not.toContain("useLoginForm");
		expect(content).not.toContain("loginMutationOptions");
	});

	it("keeps authentication components in canonical leaf folders", () => {
		expect(
			read("src/features/authentication/components/screen/index.tsx"),
		).toContain("export function AuthenticationScreen");
		expect(
			read("src/features/authentication/components/login-form/index.tsx"),
		).toContain("export function LoginForm");
		expect(
			read(
				"src/features/authentication/components/password-reset-request-form/index.tsx",
			),
		).toContain("export function PasswordResetRequestForm");
		expect(
			read(
				"src/features/authentication/components/password-reset-complete-form/index.tsx",
			),
		).toContain("export function PasswordResetCompleteForm");
	});

	it("keeps public routes declarative and feature-barrel based", () => {
		const loginRoute = read("src/routes/login.tsx");
		const passwordResetRoute = read("src/routes/recuperar-senha.tsx");

		expect(loginRoute).toContain(
			'import { AuthenticationScreen, LoginForm } from "@/features/authentication";',
		);
		expect(loginRoute).toContain("<AuthenticationScreen");
		expect(loginRoute).toContain("showBackToLoginLink={false}");
		expect(loginRoute).not.toContain("/components/");

		expect(passwordResetRoute).toContain("AuthenticationScreen,");
		expect(passwordResetRoute).toContain("<AuthenticationScreen");
		expect(passwordResetRoute).toContain("PasswordResetCompleteForm");
		expect(passwordResetRoute).toContain("PasswordResetRequestForm");
		expect(passwordResetRoute).not.toContain("/components/");
	});

	it("keeps the authentication screen on shared UI composition", () => {
		const content = read(
			"src/features/authentication/components/screen/index.tsx",
		);

		expect(content).toContain('from "@/shared/components/ui";');
		expect(content).toContain("Card");
		expect(content).toContain("Separator");
		expect(content).not.toContain("@base-ui/react");
		expect(content).not.toContain("@radix-ui/");
		expect(content).not.toContain("@/shared/components/Hui");
	});
});
