import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	getOptionalServerLoggedUserSession,
	getRequiredServerLoggedUserSession,
} from "./server";

export const sessionKeys = {
	all: ["session"] as const,
	currentRequired: () => [...sessionKeys.all, "current", "required"] as const,
	currentOptional: () => [...sessionKeys.all, "current", "optional"] as const,
};

const getCurrentSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return getRequiredServerLoggedUserSession();
	},
);

const getOptionalCurrentSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return getOptionalServerLoggedUserSession();
	},
);

export const getCurrentSessionQueryOptions = () =>
	queryOptions({
		queryKey: sessionKeys.currentRequired(),
		queryFn: getCurrentSessionFn,
		staleTime: 60 * 1000,
	});

export const getOptionalCurrentSessionQueryOptions = () =>
	queryOptions({
		queryKey: sessionKeys.currentOptional(),
		queryFn: getOptionalCurrentSessionFn,
		staleTime: 60 * 1000,
	});
