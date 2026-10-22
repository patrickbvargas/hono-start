import {
	clerkClient,
	type WebhookEvent,
} from "@clerk/tanstack-react-start/server";
import { prisma } from "@/shared/lib/prisma";

export async function reconcileClerkEmployeeEvent(
	deliveryId: string,
	event: WebhookEvent,
) {
	if (
		await prisma.clerkWebhookReceipt.findUnique({ where: { id: deliveryId } })
	) {
		return;
	}
	// Webhooks do not grant or revoke application access. Each request checks Clerk.
	// Refresh only known explicit links against current provider state, never event snapshots.
	if (
		event.type === "user.created" ||
		event.type === "user.updated" ||
		event.type === "user.deleted"
	) {
		const userId = event.data.id;
		if (userId) {
			try {
				await clerkClient().users.getUser(userId);
			} catch (error) {
				if (
					!error ||
					typeof error !== "object" ||
					!("status" in error) ||
					error.status !== 404
				) {
					throw error;
				}
				await prisma.employee.updateMany({
					where: { clerkUserId: userId },
					data: { clerkUserId: null },
				});
			}
		}
	}
	// Idempotent upsert; retries after partial execution repeat safe reconciliation.
	await prisma.clerkWebhookReceipt.upsert({
		where: { id: deliveryId },
		create: { id: deliveryId },
		update: {},
	});
}
