import { OrganizationList, SignIn, useAuth } from "@clerk/tanstack-react-start";
import { getSafeInternalRedirectPath } from "@/shared/session/client";

interface LoginFormProps {
	redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
	const { isLoaded, isSignedIn } = useAuth();
	if (!isLoaded) {
		return null;
	}
	const destination = getSafeInternalRedirectPath(redirectTo) ?? "/";
	return (
		<>
			{!isSignedIn ? (
				<SignIn routing="hash" forceRedirectUrl={destination} />
			) : null}
			{isSignedIn ? (
				<OrganizationList
					hidePersonal
					afterSelectOrganizationUrl={destination}
				/>
			) : null}
		</>
	);
}
