import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getOptionalServerLoggedUserSession } from "./server";

export const sessionKeys = {
	all: ["session"] as const,
	current: () => [...sessionKeys.all, "current"] as const,
};

const getCurrentSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return getOptionalServerLoggedUserSession();
	},
);

export const getCurrentSessionQueryOptions = () =>
	queryOptions({
		queryKey: sessionKeys.current(),
		queryFn: getCurrentSessionFn,
		staleTime: 60 * 1000,
	});
