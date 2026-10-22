import { createFileRoute } from "@tanstack/react-router";
import { handleClerkWebhook } from "@/features/authentication";

export const Route = createFileRoute("/api/webhooks/clerk")({
	server: {
		handlers: { POST: ({ request }) => handleClerkWebhook(request) },
	},
});
