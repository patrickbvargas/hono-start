import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { applicationBrandingSchema } from "../schemas/model";

const getApplicationBranding = createServerFn({ method: "GET" }).handler(
	async () => {
		const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
		const encodedHost = publishableKey.split("_")[2];
		if (!encodedHost) {
			throw new Error("Identidade da aplicação não configurada.");
		}
		const frontendApi = Buffer.from(encodedHost, "base64")
			.toString("utf8")
			.replace(/\$$/, "");
		if (!/^[a-zA-Z0-9.-]+$/.test(frontendApi)) {
			throw new Error("Identidade da aplicação inválida.");
		}
		const response = await fetch(`https://${frontendApi}/v1/environment`, {
			signal: AbortSignal.timeout(10_000),
			credentials: "omit",
			cache: "no-store",
		});
		if (!response.ok) {
			throw new Error("Não foi possível carregar a identidade da aplicação.");
		}
		return applicationBrandingSchema.parse(await response.json());
	},
);

export const applicationBrandingKeys = {
	all: ["application-branding"] as const,
	current: (publishableKey: string) =>
		[...applicationBrandingKeys.all, publishableKey] as const,
};

export function getApplicationBrandingQueryOptions() {
	const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
	return queryOptions({
		queryKey: applicationBrandingKeys.current(publishableKey),
		enabled: Boolean(publishableKey),
		staleTime: 0,
		refetchOnWindowFocus: "always",
		refetchOnReconnect: "always",
		queryFn: ({ signal }) => getApplicationBranding({ signal }),
	});
}
