import { createMiddleware } from "@tanstack/react-start";
import type { LoggedUserSession } from "./model";
import { getRequiredServerLoggedUserSession } from "./server";

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
