import { beforeEach, describe, expect, it, vi } from "vitest";

const { envMock, resendMock, resendSendMock } = vi.hoisted(() => ({
	envMock: {
		RESEND_API_KEY: "re_test_key" as string | undefined,
		RESEND_FROM_EMAIL: "no-reply@example.com" as string | undefined,
		RESEND_FROM_NAME: "Hono",
	},
	resendMock: vi.fn(),
	resendSendMock: vi.fn(),
}));

vi.mock("@/shared/config/env", () => ({
	env: envMock,
}));

vi.mock("resend", () => ({
	Resend: resendMock,
}));

import {
	createPasswordResetEmailContent,
	sendPasswordResetEmail,
} from "../password-reset-email";

describe("password reset email", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		envMock.RESEND_API_KEY = "re_test_key";
		envMock.RESEND_FROM_EMAIL = "no-reply@example.com";
		envMock.RESEND_FROM_NAME = "Hono";
		resendMock.mockImplementation(() => ({
			emails: {
				send: resendSendMock,
			},
		}));
		resendSendMock.mockResolvedValue({
			data: {
				id: "email_123",
			},
			error: null,
		});
	});

	it("builds pt-BR reset content with safe escaped html", () => {
		const content = createPasswordResetEmailContent({
			resetUrl: 'https://app.test/recuperar-senha?token=abc<123>"',
		});

		expect(content.subject).toBe("Redefinição de senha");
		expect(content.text).toContain(
			'https://app.test/recuperar-senha?token=abc<123>"',
		);
		expect(content.html).toContain("&lt;123&gt;&quot;");
		expect(content.html).toContain("ignore este email");
	});

	it("sends reset email through resend with configured sender", async () => {
		await sendPasswordResetEmail({
			email: "carlos@example.com",
			resetUrl: "https://app.test/recuperar-senha?token=abc123",
		});

		expect(resendMock).toHaveBeenCalledWith("re_test_key");
		expect(resendSendMock).toHaveBeenCalledWith({
			from: "Hono <no-reply@example.com>",
			to: ["carlos@example.com"],
			subject: "Redefinição de senha",
			text: expect.stringContaining(
				"https://app.test/recuperar-senha?token=abc123",
			),
			html: expect.stringContaining(
				"https://app.test/recuperar-senha?token=abc123",
			),
		});
	});

	it("fails fast when resend config is missing", async () => {
		envMock.RESEND_API_KEY = undefined;

		await expect(
			sendPasswordResetEmail({
				email: "carlos@example.com",
				resetUrl: "https://app.test/recuperar-senha?token=abc123",
			}),
		).rejects.toThrow("Configuração de email de redefinição indisponível");

		expect(resendMock).not.toHaveBeenCalled();
	});
});
