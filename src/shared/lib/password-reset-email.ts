import { Resend } from "resend";
import { env } from "@/shared/config/env";

const PASSWORD_RESET_EMAIL_SUBJECT = "Redefinição de senha";
const PASSWORD_RESET_EMAIL_CONFIGURATION_ERROR =
	"Configuração de email de redefinição indisponível";

interface PasswordResetEmailParams {
	email: string;
	resetUrl: string;
}

interface PasswordResetEmailContentParams {
	resetUrl: string;
}

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function getPasswordResetSender() {
	if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
		throw new Error(PASSWORD_RESET_EMAIL_CONFIGURATION_ERROR);
	}

	return {
		apiKey: env.RESEND_API_KEY,
		from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
	};
}

export function createPasswordResetEmailContent({
	resetUrl,
}: PasswordResetEmailContentParams) {
	const safeResetUrl = escapeHtml(resetUrl);

	return {
		subject: PASSWORD_RESET_EMAIL_SUBJECT,
		text: [
			"Recebemos uma solicitação para redefinir sua senha no Hono.",
			"",
			`Acesse o link abaixo para criar uma nova senha: ${resetUrl}`,
			"",
			"Se você não solicitou a redefinição, ignore este email.",
		].join("\n"),
		html: [
			'<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827">',
			'<h1 style="font-size:20px;margin:0 0 16px">Redefinição de senha</h1>',
			'<p style="margin:0 0 16px">Recebemos uma solicitação para redefinir sua senha no Hono.</p>',
			`<p style="margin:0 0 16px"><a href="${safeResetUrl}">Clique aqui para criar uma nova senha</a></p>`,
			`<p style="margin:0 0 16px">Se o botão não funcionar, copie e cole este link no navegador:<br /><span>${safeResetUrl}</span></p>`,
			'<p style="margin:0">Se você não solicitou a redefinição, ignore este email.</p>',
			"</div>",
		].join(""),
	};
}

export async function sendPasswordResetEmail({
	email,
	resetUrl,
}: PasswordResetEmailParams) {
	const sender = getPasswordResetSender();
	const resend = new Resend(sender.apiKey);
	const content = createPasswordResetEmailContent({
		resetUrl,
	});
	const { error } = await resend.emails.send({
		from: sender.from,
		to: [email],
		subject: content.subject,
		text: content.text,
		html: content.html,
	});

	if (error) {
		throw new Error(error.message);
	}
}
