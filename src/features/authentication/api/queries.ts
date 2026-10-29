import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getLoginOrganizationCount } from "../data/login";
import { loginOrganizationCountSchema } from "../schemas/login";

const getLoginOrganizationCountFn = createServerFn({ method: "GET" }).handler(
	async () =>
		loginOrganizationCountSchema.parse(await getLoginOrganizationCount()),
);

export const authenticationKeys = {
	organizationCount: ["authentication", "organization-count"] as const,
};

export const getLoginOrganizationCountQueryOptions = () =>
	queryOptions({
		queryKey: authenticationKeys.organizationCount,
		queryFn: async () =>
			loginOrganizationCountSchema.parse(await getLoginOrganizationCountFn()),
		staleTime: 0,
	});
