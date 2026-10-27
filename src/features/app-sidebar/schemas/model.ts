import * as z from "zod";

export const applicationBrandingSchema = z
	.object({
		display_config: z.object({
			application_name: z.string().trim().min(1),
			logo_image_url: z.url().nullish(),
		}),
	})
	.transform(({ display_config }) => ({
		name: display_config.application_name,
		imageUrl: display_config.logo_image_url ?? undefined,
	}));
