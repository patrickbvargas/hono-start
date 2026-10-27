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

export const sidebarKeys = {
	all: ["app-sidebar"] as const,
	branding: (frontendApi: string) =>
		[...sidebarKeys.all, "branding", frontendApi] as const,
};

export function getApplicationBrandingQueryOptions(frontendApi: string) {
	return queryOptions({
		queryKey: sidebarKeys.branding(frontendApi),
		enabled: Boolean(frontendApi),
		staleTime: 0,
		refetchOnWindowFocus: "always",
		queryFn: ({ signal }) => getApplicationBranding({ signal }),
	});
}
