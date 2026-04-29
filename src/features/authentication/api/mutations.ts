import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/shared/session";
import {
	loginInputSchema,
	passwordResetCompleteInputSchema,
	passwordResetRequestInputSchema,
} from "../schemas/form";

const loginFn = createServerFn({ method: "POST" })
	.inputValidator(loginInputSchema)
	.handler(async (ctx) => {
		const { loginMutationHandler } = await import("./mutation-handlers");
		return loginMutationHandler(ctx);
	});

const logoutFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.handler(async () => {
		const { logoutMutationHandler } = await import("./mutation-handlers");
		return logoutMutationHandler();
	});

const requestPasswordResetFn = createServerFn({ method: "POST" })
	.inputValidator(passwordResetRequestInputSchema)
	.handler(async (ctx) => {
		const { requestPasswordResetMutationHandler } = await import(
			"./mutation-handlers"
		);
		return requestPasswordResetMutationHandler(ctx);
	});

const resetPasswordFn = createServerFn({ method: "POST" })
	.inputValidator(passwordResetCompleteInputSchema)
	.handler(async (ctx) => {
		const { resetPasswordMutationHandler } = await import(
			"./mutation-handlers"
		);
		return resetPasswordMutationHandler(ctx);
	});

export const loginMutationOptions = () =>
	mutationOptions({
		mutationFn: loginFn,
	});

export const logoutMutationOptions = () =>
	mutationOptions({
		mutationFn: logoutFn,
	});

export const requestPasswordResetMutationOptions = () =>
	mutationOptions({
		mutationFn: requestPasswordResetFn,
	});

export const resetPasswordMutationOptions = () =>
	mutationOptions({
		mutationFn: resetPasswordFn,
	});
