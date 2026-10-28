import { OrganizationList, SignIn, useAuth } from "@clerk/tanstack-react-start";
import type { SessionAccess } from "@/shared/session";
import { getSafeInternalRedirectPath } from "@/shared/session/client";
import { AccessRecovery } from "../access-recovery";

interface LoginFormProps {
	redirectTo?: string;
	access?: SessionAccess;
}

export function LoginForm({ redirectTo, access }: LoginFormProps) {
	const { isLoaded, isSignedIn, orgId } = useAuth();
	if (!isLoaded) {
		return null;
	}
	const destination = getSafeInternalRedirectPath(redirectTo) ?? "/";
	const hasConfigurationIssue = access?.status === "configuration_required";
	return (
		<>
			{!isSignedIn ? (
				<SignIn routing="hash" forceRedirectUrl={destination} />
			) : null}
			{isSignedIn ? (
				<div className="flex w-full max-w-sm flex-col gap-4">
					{orgId ? (
						<AccessRecovery
							issues={
								access?.status === "configuration_required"
									? access.issues
									: undefined
							}
						/>
					) : null}
					{!hasConfigurationIssue ? (
						<OrganizationList
							hidePersonal
							afterSelectOrganizationUrl={destination}
						/>
					) : null}
				</div>
			) : null}
		</>
	);
}
