import { createFileRoute } from "@tanstack/react-router";
import { handleClerkEmployeeWebhook } from "@/features/employees";

export const Route = createFileRoute("/api/webhooks/clerk")({
	server: {
		handlers: { POST: ({ request }) => handleClerkEmployeeWebhook(request) },
	},
});
