import { createServerOnlyFn } from "@tanstack/react-start";

export const handleClerkEmployeeWebhook = createServerOnlyFn(
	async (request: Request): Promise<Response> => {
		const { verifyWebhook } = await import("@clerk/backend/webhooks");
		const { env } = await import("@/shared/config/env");
		const { reconcileClerkEmployeeEvent } = await import(
			"../data/clerk-lifecycle"
		);
		if (!env.CLERK_WEBHOOK_SIGNING_SECRET) {
			return new Response("Webhook unavailable", { status: 503 });
		}
		let event: Awaited<ReturnType<typeof verifyWebhook>>;
		try {
			event = await verifyWebhook(request, {
				signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET,
			});
		} catch {
			return new Response("Invalid signature", { status: 400 });
		}
		const deliveryId = request.headers.get("svix-id");
		if (!deliveryId) {
			return new Response("Missing delivery ID", { status: 400 });
		}
		try {
			await reconcileClerkEmployeeEvent(deliveryId, event);
			return new Response("OK");
		} catch {
			return new Response("Reconciliation unavailable", { status: 503 });
		}
	},
);
