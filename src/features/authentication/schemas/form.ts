import * as z from "zod";
import { AUTHENTICATION_ERRORS } from "../constants/errors";
import {
	isEmailIdentifier,
	isOabIdentifier,
	normalizeAuthenticationIdentifier,
} from "../utils/normalization";

const passwordSchema = z
	.string()
	.min(8, "A senha deve ter pelo menos 8 caracteres.");

const authenticationIdentifierSchema = z
	.string()
	.trim()
	.min(1, "Informe seu email ou número da OAB.")
	.refine((value) => {
		const normalized = normalizeAuthenticationIdentifier(value);

		if (isEmailIdentifier(normalized)) {
			return z.email().safeParse(normalized).success;
		}

		return isOabIdentifier(normalized);
	}, AUTHENTICATION_ERRORS.INVALID_CREDENTIALS);

export const loginInputSchema = z.object({
	identifier: authenticationIdentifierSchema,
	password: passwordSchema,
	rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const passwordResetRequestInputSchema = z.object({
	identifier: z.string().trim().min(1, "Informe seu email ou número da OAB."),
});

export type PasswordResetRequestInput = z.infer<
	typeof passwordResetRequestInputSchema
>;

export const passwordResetCompleteInputSchema = z
	.object({
		token: z.string().trim().min(1, AUTHENTICATION_ERRORS.RESET_INVALID_TOKEN),
		newPassword: passwordSchema,
		confirmPassword: passwordSchema,
	})
	.refine((value) => value.newPassword === value.confirmPassword, {
		message: "As senhas devem ser iguais.",
		path: ["confirmPassword"],
	});

export type PasswordResetCompleteInput = z.infer<
	typeof passwordResetCompleteInputSchema
>;
