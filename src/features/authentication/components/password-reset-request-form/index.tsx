import { SignIn } from "@clerk/tanstack-react-start";

export function PasswordResetRequestForm() {
	return <SignIn routing="hash" forceRedirectUrl="/" />;
}
