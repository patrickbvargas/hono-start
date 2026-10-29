import { useAuth, useSession } from "@clerk/tanstack-react-start";
import { useSyncExternalStore } from "react";
import type { SessionAccess } from "@/shared/session";
import { getSafeInternalRedirectPath } from "@/shared/session/client";

function subscribeToHashChange(onChange: () => void) {
	window.addEventListener("hashchange", onChange);
	window.addEventListener("popstate", onChange);
	return () => {
		window.removeEventListener("hashchange", onChange);
		window.removeEventListener("popstate", onChange);
	};
}

export function useLogin(redirectTo?: string, access?: SessionAccess) {
	const { orgId } = useAuth();
	const { session } = useSession();
	const hash = useSyncExternalStore(
		subscribeToHashChange,
		() => window.location.hash,
		() => null,
	);
	const hasPendingTask = session?.status === "pending" && !!session.currentTask;
	const destination = getSafeInternalRedirectPath(redirectTo) ?? "/";
	const afterSignInUrl = `/login?selectOrganization=true&redirect=${encodeURIComponent(destination)}`;
	return {
		afterSignInUrl,
		orgId,
		destination,
		hasConfigurationIssue: access?.status === "configuration_required",
		hasPendingTask,
		isTaskLocationReady: hash !== null,
		shouldRedirectToTasks:
			hasPendingTask && hash !== null && !hash.startsWith("#/tasks/"),
	};
}
