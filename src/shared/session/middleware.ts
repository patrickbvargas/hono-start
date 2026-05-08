import { createMiddleware } from "@tanstack/react-start";
import { getRequiredServerLoggedUserSession } from "./server";
import type { LoggedUserSession } from "./types";

export interface AuthenticatedServerFunctionContext {
	session: LoggedUserSession;
}

export const authMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	const session = await getRequiredServerLoggedUserSession();

	return next({
		context: {
			session,
		} satisfies AuthenticatedServerFunctionContext,
	});
});
