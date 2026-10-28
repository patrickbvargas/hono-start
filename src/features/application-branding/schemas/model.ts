import * as z from "zod";

const imageUrlSchema = z
	.url({ protocol: /^https?$/ })
	.optional()
	.catch(undefined);

export const DEFAULT_APPLICATION_NAME = "Hono";
export const DEFAULT_FAVICON_URL = "/favicon.ico";

export const applicationBrandingSchema = z
	.object({
		display_config: z.object({
			application_name: z
				.string()
				.trim()
				.min(1)
				.catch(DEFAULT_APPLICATION_NAME),
			logo_image_url: imageUrlSchema,
			favicon_image_url: imageUrlSchema,
		}),
	})
	.transform(({ display_config }) => ({
		name: display_config.application_name,
		imageUrl: display_config.logo_image_url ?? undefined,
		faviconUrl: display_config.favicon_image_url ?? undefined,
	}));

export type ApplicationBranding = z.infer<typeof applicationBrandingSchema>;

export const DEFAULT_APPLICATION_BRANDING: ApplicationBranding = {
	name: DEFAULT_APPLICATION_NAME,
	imageUrl: undefined,
	faviconUrl: undefined,
};
