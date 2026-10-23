import { SignUp } from "@clerk/tanstack-react-start";

export function InvitationSetup() {
	return <SignUp routing="hash" signInUrl="/login" forceRedirectUrl="/" />;
}
