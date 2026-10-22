import { UserProfile } from "@clerk/tanstack-react-start";

export function ForcedChangePasswordForm() {
	return <UserProfile routing="hash" />;
}
