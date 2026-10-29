import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { createServerOnlyFn } from "@tanstack/react-start";

export const getLoginOrganizationCount = createServerOnlyFn(async () => {
	const identity = await auth();
	if (!identity.userId || !identity.isAuthenticated) {
		return 0;
	}
	const memberships = await clerkClient().users.getOrganizationMembershipList({
		userId: identity.userId,
		limit: 1,
	});
	return memberships.totalCount;
});
