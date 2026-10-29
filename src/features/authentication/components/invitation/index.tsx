import { SignUp } from "@clerk/tanstack-react-start";

import { ClerkStatus } from "../clerk-status";

export function InvitationSetup() {
	return (
		<ClerkStatus>
			<SignUp routing="hash" signInUrl="/login" forceRedirectUrl="/" />
		</ClerkStatus>
	);
}
