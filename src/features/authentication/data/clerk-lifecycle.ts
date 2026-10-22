import type { WebhookEvent } from "@clerk/tanstack-react-start/server";
import { prisma } from "@/shared/lib/prisma";

export async function recordClerkEvent(
	deliveryId: string,
	_event: WebhookEvent,
) {
	if (
		await prisma.clerkWebhookReceipt.findUnique({ where: { id: deliveryId } })
	) {
		return;
	}
	// Idempotent upsert; retries after partial execution repeat safe reconciliation.
	await prisma.clerkWebhookReceipt.upsert({
		where: { id: deliveryId },
		create: { id: deliveryId },
		update: {},
	});
}
